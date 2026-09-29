import { reactRouter } from '@react-router/dev/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { envOnlyMacros } from 'vite-env-only'
import { iconsSpritesheet } from 'vite-plugin-icons-spritesheet'

const MODE = process.env.NODE_ENV

/**
 * Every value `@sentry/vite-plugin` needs before it will create a release and
 * upload source maps. Each one has exactly one supplier, and they live in three
 * different files: the deploy workflow passes it as a `--build-secret` or
 * `--build-arg`, the build stage of `other/Dockerfile` mounts and exports it,
 * and the plugin below reads it. `tests/sentry-release.test.ts` fails if those
 * three drift apart.
 */
const SENTRY_RELEASE_ENV = {
	SENTRY_ORG: process.env.SENTRY_ORG,
	SENTRY_PROJECT: process.env.SENTRY_PROJECT,
	// The release is named after the commit. The server SDK also tags its events
	// with it (see `server/utils/monitoring.ts`), so it is the one value that has
	// to mean the same thing at build time and at runtime.
	COMMIT_SHA: process.env.COMMIT_SHA,
} as Record<string, string | undefined>

/**
 * Returns the Sentry plugin, or `null` when release management is off.
 *
 * A missing option is not an error as far as the plugin is concerned: it logs
 * `logger.warn` and returns from `createRelease` and from `uploadSourcemaps`,
 * having already injected the debug IDs during the bundle phase. The result is
 * that a completely misconfigured build produces exactly the same artifacts as a
 * working one — debug IDs present, `SENTRY_RELEASE` set — while the release
 * never exists in Sentry and no source maps are ever uploaded. Every deploy up
 * to 2026-09-29 looked fine and was not, because the workflow passed
 * `SENTRY_AUTH_TOKEN` but not `SENTRY_ORG`.
 *
 * The upload is the plugin's only shot: it runs at build time, and it is gone by
 * the time anything is deployed. There is no retry and no fallback, so when the
 * plugin is going to do work, refuse to build until the values are all there.
 * A red build is much cheaper than a release that silently does not exist.
 */
function getSentryPlugin() {
	const authToken = process.env.SENTRY_AUTH_TOKEN

	// A disabled plugin returns before it validates anything, so there is nothing
	// worth asserting about a development build.
	if (!authToken || MODE !== 'production') return null

	const missing = Object.keys(SENTRY_RELEASE_ENV).filter(
		(name) => !SENTRY_RELEASE_ENV[name],
	)
	if (missing.length > 0) {
		const listed = missing.join(', ')
		const pronoun = missing.length === 1 ? 'is' : 'are'
		const object = missing.length === 1 ? 'it' : 'them'
		throw new Error(
			`Sentry release management is enabled (SENTRY_AUTH_TOKEN is set) but ${listed} ${pronoun} missing from the build environment, so @sentry/vite-plugin would log a warning and skip creating the release and uploading source maps. Set ${object} in the build: the deploy workflow passes ${object} to "flyctl deploy" and other/Dockerfile mounts ${object} into the build stage. To build without release management, unset SENTRY_AUTH_TOKEN.`,
		)
	}

	// Narrowed by the check above; the cast keeps that fact across the boundary
	// without a non-null assertion on each lookup.
	const releaseEnv = SENTRY_RELEASE_ENV as Record<string, string>

	return sentryVitePlugin({
		authToken,
		org: releaseEnv.SENTRY_ORG,
		project: releaseEnv.SENTRY_PROJECT,
		release: {
			name: releaseEnv.COMMIT_SHA,
			setCommits: {
				auto: true,
			},
		},
		sourcemaps: {
			filesToDeleteAfterUpload: ['./build/**/*.map'],
		},
	})
}

export default defineConfig({
	environments: {
		// server/app.ts is the entry of the SSR build rather than React
		// Router's virtual server build, so the Express request handler is
		// bundled into build/server/index.js and server/index.ts mounts it
		// from there. It has to be set per environment: @react-router/dev
		// replaces the top-level `build.rollupOptions.input` with its virtual
		// server build in its own config hook.
		ssr: {
			build: {
				rollupOptions: {
					input: './server/app.ts',
				},
			},
			// server/app.ts is loaded by Vite in development, and it hands
			// createRequestHandler a RouterContextProvider that the handler then
			// checks with `instanceof`. React Router's `development` export
			// condition gives Vite and Node two different builds of the package,
			// so the handler has to be bundled into the same graph as the
			// provider rather than externalized into Node's.
			resolve: {
				noExternal: ['@react-router/express'],
			},
		},
	},
	build: {
		target: 'es2022',
		cssMinify: MODE === 'production',

		rollupOptions: {
			external: [/node:.*/, 'fsevents'],
		},

		// The sprite stays a single immutable-cached request that app/root.tsx
		// preloads rather than ~5 KB of data URI inlined into every document.
		// The plugin also excludes the spritesheet it generates, but it does so
		// by string-matching the asset's path against its outputDir, which its
		// own issues report as having silently stopped matching on some
		// setups. If that regresses, the sprite inlines itself and the preload
		// becomes a no-op with nothing failing, so keep the case here too.
		assetsInlineLimit: (source: string) => {
			if (
				source.endsWith('sprite.svg') ||
				source.endsWith('apple-touch-icon.png')
			) {
				return false
			}
		},

		sourcemap: true,
	},
	plugins: [
		envOnlyMacros(),
		iconsSpritesheet({
			inputDir: './other/svg-icons',
			outputDir: './app/components/ui/icons',
			fileName: 'sprite.svg',
			// A .ts file, not a .d.ts: the generated module exports the icon
			// name array as a value, and a const initializer in an ambient
			// context is an error that only skipLibCheck hides.
			typesOutputFile: './app/components/ui/icons/name.ts',
			withTypes: true,
			// Keep the kebab-case file names (arrow-left-outline) rather than
			// the plugin's default camelCase transform, so the existing
			// <Icon name="..."> call sites keep working.
			iconNameTransformer: (name) => name,
		}),
		reactRouter(),
		react({
			babel: {
				plugins: ['babel-plugin-react-compiler'],
			},
		}),
		getSentryPlugin(),
	],
})
