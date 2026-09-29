import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

/**
 * `@sentry/vite-plugin` creates a Sentry release and uploads source maps only
 * when every value it needs is present at build time. It signals a missing one
 * with `logger.warn` and then returns, *after* it has already injected the debug
 * IDs during the bundle phase. A build with nothing configured and a build that
 * worked perfectly therefore produce indistinguishable artifacts: both have
 * debug IDs in the bundle and both build green.
 *
 * That is not theoretical. From 2024-04-16 until 2026-09-29 the deploy workflow
 * passed `SENTRY_AUTH_TOKEN` as a build secret but kept `SENTRY_ORG` and
 * `SENTRY_PROJECT` as Fly *runtime* secrets, where the Docker build cannot see
 * them. The plugin's `org` guard fired on every deploy, no release was ever
 * created, and no source map was ever uploaded. Worse, `filesToDeleteAfterUpload`
 * is honoured in the `finally` of `writeBundle` rather than only after a
 * successful upload, so the maps were deleted anyway — leaving symbolication
 * broken on the client too, with nothing left to debug it with. See #16.
 *
 * Nothing in the type system links the three files that have to agree: the
 * workflow that supplies the values, the Dockerfile that mounts them, and the
 * config that reads them. Dropping one `--build-secret` line, or one
 * `--mount`/`export` pair, is a small edit that disables the whole pipeline
 * without failing a single check. These tests are that link.
 *
 * The build-time assertion in `getSentryPlugin()` covers a value being *absent
 * at build time*. It cannot cover one being absent from the wiring, because by
 * then the assertion and the plugin are reading the same empty variable and
 * agree with each other. That is what these are for.
 */

const VITE_CONFIG = 'vite.config.ts'
const DOCKERFILE = 'other/Dockerfile'
const DEPLOY_WORKFLOW = '.github/workflows/deploy.yml'

const read = (path: string) => readFileSync(path, 'utf8')

/** Every distinct capture of `pattern` in `source`, sorted. */
function matchAll(source: string, pattern: RegExp) {
	return [
		...new Set([...source.matchAll(pattern)].map((match) => match[1])),
	].sort()
}

/**
 * The `as build` stage of the Dockerfile, which is the only stage that runs
 * `npm run build` and therefore the only one these values have to reach.
 *
 * Scoped to that stage because `ARG` does not cross a `FROM`, so a value
 * declared in one stage says nothing about the next, and a `--mount` outside
 * the build stage would be a different mechanism entirely.
 */
function buildStage() {
	const dockerfile = read(DOCKERFILE)
	const start = dockerfile.indexOf('FROM base as build')
	const end = dockerfile.indexOf('\nFROM base\n')
	expect(
		start,
		`could not find the \`FROM base as build\` stage in ${DOCKERFILE}`,
	).toBeGreaterThan(-1)
	expect(
		end,
		`could not find the final \`FROM base\` stage in ${DOCKERFILE}`,
	).toBeGreaterThan(start)
	return dockerfile.slice(start, end)
}

/**
 * Every build input `@sentry/vite-plugin` reads, as named in `vite.config.ts`.
 *
 * Matched as a pattern rather than listed literally, so adding a value to
 * `SENTRY_RELEASE_ENV` makes this test demand the wiring for it instead of
 * silently continuing to pass.
 */
function envUsedByPlugin() {
	return matchAll(
		read(VITE_CONFIG),
		/process\.env\.(SENTRY_[A-Z_]+|COMMIT_SHA)\b/g,
	)
}

/** Everything `flyctl deploy` was told to make available to the build. */
function buildInputsFromWorkflow() {
	return matchAll(
		read(DEPLOY_WORKFLOW),
		// The name may be quoted, because its value is a shell expansion rather
		// than a ${{ }} interpolation.
		/--build-(?:secret|arg)\s+"?([A-Z_]+)=/g,
	)
}

/**
 * Secrets the build stage mounts under `/run/secrets`.
 *
 * Deliberately scoped to the `as build` stage. `ARG` does not cross a `FROM`,
 * so each stage has to redeclare what it needs, and a `--mount` in the runtime
 * stage would be a different mechanism entirely.
 */
function mountedSecrets() {
	return matchAll(buildStage(), /--mount=type=secret,id=(SENTRY_[A-Z_]+)\b/g)
}

/**
 * Secrets the build stage reads back out of `/run/secrets` and exports. A mount
 * on its own puts a file there and sets no environment variable, so the export
 * is a separate, separately-omittable step.
 */
function exportedSecrets() {
	return matchAll(
		buildStage(),
		/export\s+(SENTRY_[A-Z_]+)="\$\(cat \/run\/secrets\//g,
	)
}

describe('Sentry release management build inputs', () => {
	it('reads the four environment variables the plugin needs', () => {
		// Guards the three comparisons below. If a refactor changes how the
		// config reads its environment, every matcher here returns [] and the
		// assertions after this one all pass vacuously — the exact failure mode
		// this file exists to prevent.
		expect(envUsedByPlugin()).toEqual([
			'COMMIT_SHA',
			'SENTRY_AUTH_TOKEN',
			'SENTRY_ORG',
			'SENTRY_PROJECT',
		])
	})

	it('passes every one of them to flyctl deploy', () => {
		expect(buildInputsFromWorkflow()).toEqual(envUsedByPlugin())
	})

	it('mounts every Sentry secret in the build stage', () => {
		// COMMIT_SHA is deliberately absent: it is a build arg, not a secret, and
		// reaches the build stage through `ARG COMMIT_SHA` instead.
		expect(mountedSecrets()).toEqual(
			envUsedByPlugin().filter((name) => name !== 'COMMIT_SHA'),
		)
	})

	it('exports every mounted secret, because --mount alone sets no variable', () => {
		expect(exportedSecrets()).toEqual(mountedSecrets())
	})

	it('gives the Dockerfile a build arg for the commit, which is not a secret', () => {
		const dockerfile = buildStage()
		expect(dockerfile).toMatch(/^ARG COMMIT_SHA$/m)
		// `ENV` too, because `ARG` alone is not visible to the RUN that runs
		// `npm run build` — and `getSentryPlugin()` reads process.env.COMMIT_SHA.
		expect(dockerfile).toMatch(/^ENV COMMIT_SHA=\$COMMIT_SHA$/m)
	})

	it('supplies every build secret from the step env, not a ${{ }} interpolation', () => {
		// The deploy step passes each secret as `--build-secret "NAME=$NAME"`, so
		// the value is a shell expansion. If the `env:` entry behind it were
		// dropped, `flyctl` would forward the literal string `$SENTRY_ORG` as a
		// secret and the build would fail far from the cause. `COMMIT_SHA` is
		// excluded because it is an interpolated `github.sha`, not a secret.
		const suppliedByEnv = matchAll(
			read(DEPLOY_WORKFLOW),
			/^\s+(SENTRY_[A-Z_]+): \$\{\{ secrets\./gm,
		)
		expect(suppliedByEnv).toEqual(
			buildInputsFromWorkflow().filter((name) => name !== 'COMMIT_SHA'),
		)
	})
})
