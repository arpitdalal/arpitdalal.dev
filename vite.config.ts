import { reactRouter } from '@react-router/dev/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { envOnlyMacros } from 'vite-env-only'
import { iconsSpritesheet } from 'vite-plugin-icons-spritesheet'

const MODE = process.env.NODE_ENV

/**
 * Every environment variable `@sentry/vite-plugin` reads to create a release
 * and upload source maps. Each one has exactly one supplier, and they live in
 * three different files: the deploy workflow passes it as a `--build-secret` or
 * `--build-arg`, the build stage of `other/Dockerfile` mounts and exports it,
 * and this function reads it. `tests/sentry-release.test.ts` fails if those
 * three drift apart.
 *
 * Read inside the function rather than cached at module scope so the guard
 * below is a pure function of the environment at the moment it runs, which is
 * what makes both of its branches testable.
 */
function getSentryEnv() {
	return {
		SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
		SENTRY_ORG: process.env.SENTRY_ORG,
		SENTRY_PROJECT: process.env.SENTRY_PROJECT,
		// The release is named after the commit. #15 makes the server SDK tag its
		// events with the same value, so it is the one variable that has to mean
		// the same thing at build time and at runtime.
		COMMIT_SHA: process.env.COMMIT_SHA,
	}
}

/**
 * Returns the Sentry plugin, or `null` when release management is off.
 *
 * A missing option is not an error as far as the plugin is concerned. It calls
 * `logger.warn` and returns from `createRelease` and from `uploadSourcemaps`,
 * having already injected the debug IDs during the bundle phase. So a build with
 * nothing configured and a build that worked perfectly produce indistinguishable
 * artifacts: both have debug IDs in the bundle, and both build green. From
 * 2024-04-16 until 2026-09-29 the workflow passed `SENTRY_AUTH_TOKEN` but not
 * `SENTRY_ORG`, and every deploy was the first kind. See #16.
 *
 * The upload is the plugin's only shot: it runs at build time and is gone by the
 * time anything is deployed. So when the plugin is going to do work, refuse to
 * build until every value it needs is present.
 */
export function getSentryPlugin() {
	const env = getSentryEnv()

	// Unset token means release management is off, which is what every local
	// build does. A non-production build never reaches the assertions below: a
	// disabled plugin returns from the plugin manager before it validates
	// anything, so there would be nothing for them to protect.
	if (!env.SENTRY_AUTH_TOKEN || process.env.NODE_ENV !== 'production') {
		return null
	}

	// Falsy, not merely undefined: an empty secret reaches the build as an empty
	// file, exports as an empty string, and would otherwise pass a presence check
	// and then be sent to Sentry as an empty org slug.
	const missing = Object.entries(env)
		.filter(([, value]) => !value)
		.map(([name]) => name)
	if (missing.length > 0) {
		const listed = missing.join(', ')
		const many = missing.length > 1
		throw new Error(
			`Sentry release management is enabled (SENTRY_AUTH_TOKEN is set) but ${listed} ${many ? 'are' : 'is'} missing or empty in the build environment, so @sentry/vite-plugin would warn and skip creating the release and uploading source maps. Set ${many ? 'them' : 'it'} in the build: the deploy workflow passes ${many ? 'them' : 'it'} to "flyctl deploy" and other/Dockerfile mounts ${many ? 'them' : 'it'} into the build stage. To build without release management, unset SENTRY_AUTH_TOKEN.`,
		)
	}

	return sentryVitePlugin({
		authToken: env.SENTRY_AUTH_TOKEN,
		org: env.SENTRY_ORG,
		project: env.SENTRY_PROJECT,
		// The plugin's documented default is to throw from here and stop the
		// build. The shipped 11.0.0 implementation does not: it logs and
		// continues. Restoring the documented behaviour is what makes the stance
		// above true, and it matters more than it looks — `filesToDeleteAfterUpload`
		// below is honoured in the `finally` of the plugin's writeBundle hook
		// whether or not the upload succeeded, so a swallowed failure would
		// delete every source map from the image and still exit zero.
		errorHandler: (error) => {
			throw error
		},
		release: {
			name: env.COMMIT_SHA,
			// `setCommits` is deliberately omitted. The plugin's own default
			// (`{ auto: true, shouldNotThrowOnFailure: true, ... }`) is what makes
			// a commit-association failure non-fatal; naming `auto` explicitly
			// opts out of `shouldNotThrowOnFailure`, and the resulting throw skips
			// `finalizeRelease`, leaving the release stuck in `new` forever. Note
			// that `auto` cannot actually succeed in the build stage regardless:
			// the base image has no `git`, so there is nothing for it to read a
			// repository from. Commit association needs either a Sentry GitHub
			// integration or a `sentry-cli releases set-commits` run from the
			// deploy job, which has a checkout.
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
