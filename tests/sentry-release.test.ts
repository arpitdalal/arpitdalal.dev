import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

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
 * created, and no source map was ever uploaded. See #16.
 *
 * Nothing in the type system links the three files that have to agree: the
 * workflow that supplies the values, the Dockerfile that mounts them, and the
 * config that reads them. Dropping one `--build-secret` line, or one
 * `--mount`/`export` pair, is a small edit that disables the whole pipeline
 * without failing a single check. These tests are that link.
 *
 * They are about the *wiring*, not the values. `getSentryPlugin()` already
 * refuses to build when a value is absent or empty, so a test here could not
 * catch a name that never reaches it — by then the guard and the plugin are
 * reading the same empty variable and agree with each other.
 */

const VITE_CONFIG = 'vite.config.ts'
const DOCKERFILE = 'other/Dockerfile'
const DEPLOY_WORKFLOW = '.github/workflows/deploy.yml'

/** Directories that make up the running application. */
const RUNTIME_ROOTS = ['app', 'server', 'index.ts']

/**
 * The one Sentry variable the deploy must leave in place, and the three it must
 * remove once the build has been proven to work.
 *
 * `SENTRY_DSN` is read at runtime by `server/utils/monitoring.ts` and shipped to
 * the browser by `getEnv()`. The other three are read only by `vite.config.ts`,
 * which is build-time, so leaving them in the runtime environment means holding
 * a Sentry API token in the production process for no reason.
 */
const RUNTIME_ONLY = 'SENTRY_DSN'
const BUILD_ONLY = [
	'SENTRY_AUTH_TOKEN',
	'SENTRY_ORG',
	'SENTRY_PROJECT',
] as const

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
 * declared in one stage says nothing about the next, and a `--mount` in the
 * runtime stage would be a different mechanism entirely.
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
 * Every build input `getSentryPlugin()` reads, as named in `vite.config.ts`.
 *
 * Matched as a pattern rather than listed literally, so adding a value to
 * `getSentryEnv()` makes this test demand the wiring for it instead of silently
 * continuing to pass.
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

/** Secrets the build stage mounts under `/run/secrets`. */
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

/** Every source file that makes up the running application. */
function runtimeSources() {
	const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs'])
	const files: string[] = []
	const walk = (path: string) => {
		if (!existsSync(path)) return
		if (!statSync(path).isDirectory()) {
			if (extensions.has(extname(path))) files.push(path)
			return
		}
		for (const entry of readdirSync(path, { withFileTypes: true })) {
			// Generated, gitignored, and not part of the application.
			if (entry.name === 'icons') continue
			walk(join(path, entry.name))
		}
	}
	for (const root of RUNTIME_ROOTS) walk(root)
	return files
}

describe('Sentry release management build inputs', () => {
	it('reads the four environment variables the plugin needs', () => {
		// Guards the three comparisons below. If a refactor changes how the
		// config reads its environment, every matcher here returns [] and the
		// assertions after this one all pass vacuously — the exact failure mode
		// this file exists to prevent.
		expect(envUsedByPlugin()).toEqual(['COMMIT_SHA', ...[...BUILD_ONLY].sort()])
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

	it('marks every secret mount required, so a missing one fails the build', () => {
		// The `&&` chain in the Dockerfile does not do this: `export X="$(cat
		// /run/secrets/X)"` exits 0 even when the cat fails, so a missing secret
		// would arrive as an empty string and get as far as a Sentry request.
		const mounts = buildStage()
			.split('\n')
			.filter((line) => line.includes('--mount=type=secret'))
			.map((line) => ({
				id: line.match(/id=(SENTRY_[A-Z_]+)/)?.[1],
				required: line.includes('required=true'),
			}))
		expect(mounts).toEqual(
			mountedSecrets().map((id) => ({ id, required: true })),
		)
	})

	it('gives the Dockerfile a build arg for the commit, which is not a secret', () => {
		const dockerfile = buildStage()
		expect(dockerfile).toMatch(/^ARG COMMIT_SHA$/m)
		// `ENV` too, because `ARG` alone is not visible to the RUN that runs
		// `npm run build` — and `getSentryPlugin()` reads process.env.COMMIT_SHA.
		expect(dockerfile).toMatch(/^ENV COMMIT_SHA=\$COMMIT_SHA$/m)
	})

	it('installs a CA bundle, or the Sentry CLI cannot verify TLS', () => {
		// `@sentry/vite-plugin` shells out to a native `sentry-cli`, which checks
		// TLS against the system trust store rather than Node's bundled roots.
		// `node:22.23.3-bookworm-slim` ships no CA bundle, so without this the
		// first real upload fails with "unable to get local issuer certificate" —
		// which is only reachable now that the plugin gets far enough to make a
		// request. See #16.
		expect(buildStage()).toMatch(/apt-get install[^\n]*ca-certificates/)
	})

	it('backs each build secret with a value in the step env', () => {
		// The deploy step passes each secret as `--build-secret "NAME=$NAME"`, so
		// the value is a shell expansion. If the `env:` entry behind it were
		// dropped, `flyctl` would forward the literal string `$SENTRY_ORG` and the
		// build would fail far from the cause. `COMMIT_SHA` is excluded because it
		// is an interpolated `github.sha`, not a secret.
		const backedByEnv = matchAll(
			read(DEPLOY_WORKFLOW),
			/^\s+(SENTRY_[A-Z_]+): \$\{\{ secrets\./gm,
		)
		expect(backedByEnv).toEqual(
			buildInputsFromWorkflow().filter((name) => name !== 'COMMIT_SHA'),
		)
	})

	it('rejects an empty secret before calling flyctl, since unset means empty', () => {
		// GitHub Actions expands an unset repository secret to the empty string,
		// not to nothing. So a deleted SENTRY_AUTH_TOKEN would reach
		// `getSentryPlugin()` as "" and take its "release management is off"
		// branch: a green deploy, no release, no debug IDs, nothing in the log.
		// The deploy step has to check before flyctl turns "" into a secret.
		expect(read(DEPLOY_WORKFLOW)).toMatch(
			/for name in SENTRY_AUTH_TOKEN SENTRY_ORG SENTRY_PROJECT;/,
		)
	})
})

describe('Sentry credentials at the build/runtime boundary', () => {
	// #16 removes the three build-only secrets from the Fly *runtime*
	// environment once the build is proven. That is a one-line, unreviewable
	// change to production that silently breaks anything reading them at
	// runtime, and today nothing but a human grep establishes that nothing does.
	// The issue called this the half that "can silently break production".

	it.each([...BUILD_ONLY])(
		'%s is never read by the running application',
		(name) => {
			const offenders = runtimeSources().filter((file) =>
				read(file).includes(name),
			)
			expect(
				offenders,
				`${name} is build-time only, so #16 removes it from the Fly runtime environment. These files still read it at runtime and will break when it goes:`,
			).toEqual([])
		},
	)

	it(`${RUNTIME_ONLY} is still read at runtime, since it must survive`, () => {
		// The inverse direction is the dangerous one. `SENTRY_DSN` is the single
		// value the cleanup must not take with it, and
		// `SENTRY_DSN: z.string()` accepts "", so removing it disables error
		// reporting with no boot error and no failing check.
		const readers = runtimeSources().filter((file) =>
			read(file).includes(RUNTIME_ONLY),
		)
		expect(readers.length).toBeGreaterThan(0)
	})
})

describe('getSentryPlugin()', () => {
	/**
	 * Imports the config fresh under the given environment and hands back its
	 * `getSentryPlugin()`.
	 *
	 * It has to be the *import* that is asserted, not a call afterwards:
	 * `defineConfig({ plugins: [getSentryPlugin()] })` runs at module scope, so a
	 * build that is going to fail does so while Vite is loading the config, which
	 * is exactly when it matters in production.
	 *
	 * The reset happens on the way in rather than in an `afterEach`, so nothing
	 * can leak between cases even though several of them never reach the end of
	 * the body: a rejected import skips any teardown registered after it.
	 */
	const loadUnder = async (env: Record<string, string | undefined>) => {
		vi.resetModules()
		vi.unstubAllEnvs()
		for (const [name, value] of Object.entries(env)) {
			vi.stubEnv(name, value ?? '')
		}
		return import(/* @vite-ignore */ `../${VITE_CONFIG}`)
	}

	it('is off, and asserts nothing, without an auth token', async () => {
		const { getSentryPlugin } = await loadUnder({ NODE_ENV: 'production' })
		// Every local build lands here, so this branch is what keeps `npm run
		// build` working on a machine with no Sentry credentials at all.
		expect(getSentryPlugin()).toBeNull()
	})

	it('is off outside production, because a disabled plugin never validates', async () => {
		const { getSentryPlugin } = await loadUnder({
			NODE_ENV: 'development',
			SENTRY_AUTH_TOKEN: 'token',
		})
		expect(getSentryPlugin()).toBeNull()
	})

	it.each(['SENTRY_ORG', 'SENTRY_PROJECT', 'COMMIT_SHA'])(
		'refuses to build when %s is unset',
		async (missing) => {
			await expect(
				loadUnder({
					NODE_ENV: 'production',
					SENTRY_AUTH_TOKEN: 'token',
					SENTRY_ORG: 'org',
					SENTRY_PROJECT: 'project',
					COMMIT_SHA: 'a'.repeat(40),
					[missing]: undefined,
				}),
			).rejects.toThrow(new RegExp(missing))
		},
	)

	it('refuses to build when a secret is present but empty', async () => {
		// The case an empty `--build-secret`, or a deleted GitHub secret,
		// produces. A presence check would wave it through and the plugin would
		// then send an authenticated request with an empty org slug.
		await expect(
			loadUnder({
				NODE_ENV: 'production',
				SENTRY_AUTH_TOKEN: 'token',
				SENTRY_ORG: '',
				SENTRY_PROJECT: 'project',
				COMMIT_SHA: 'a'.repeat(40),
			}),
		).rejects.toThrow(/SENTRY_ORG/)
	})

	it('returns the plugin once everything is present', async () => {
		const { getSentryPlugin } = await loadUnder({
			NODE_ENV: 'production',
			SENTRY_AUTH_TOKEN: 'token',
			SENTRY_ORG: 'org',
			SENTRY_PROJECT: 'project',
			COMMIT_SHA: 'a'.repeat(40),
		})
		const plugins = getSentryPlugin()
		// An array, which Vite flattens. Asserted so a future change to a single
		// plugin object is a deliberate edit rather than a silent one.
		expect(Array.isArray(plugins)).toBe(true)
		expect(plugins).toHaveLength(1)
		expect(plugins?.[0]?.name).toBe('sentry-vite-plugin')
	})
})
