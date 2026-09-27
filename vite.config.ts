import { reactRouter } from '@react-router/dev/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { envOnlyMacros } from 'vite-env-only'
import { iconsSpritesheet } from 'vite-plugin-icons-spritesheet'

const MODE = process.env.NODE_ENV

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

		// The plugin already returns false for the spritesheet it generates, so
		// the sprite stays a single immutable-cached request that
		// app/root.tsx preloads rather than ~5 KB of data URI inlined into
		// every document. Only the one remaining case is left here.
		assetsInlineLimit: (source: string) => {
			if (source.endsWith('apple-touch-icon.png')) {
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
			// app/components/ui/icons is generated but not gitignored from
			// prettier, so `npm run format:check` reads these files.
			formatter: 'prettier',
		}),
		reactRouter(),
		react({
			babel: {
				plugins: ['babel-plugin-react-compiler'],
			},
		}),
		process.env.SENTRY_AUTH_TOKEN
			? sentryVitePlugin({
					disable: MODE !== 'production',
					authToken: process.env.SENTRY_AUTH_TOKEN,
					org: process.env.SENTRY_ORG,
					project: process.env.SENTRY_PROJECT,
					release: {
						name: process.env.COMMIT_SHA,
						setCommits: {
							auto: true,
						},
					},
					sourcemaps: {
						filesToDeleteAfterUpload: ['./build/**/*.map'],
					},
				})
			: null,
	],
})
