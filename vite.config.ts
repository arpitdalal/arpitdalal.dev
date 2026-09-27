import { reactRouter } from '@react-router/dev/vite'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { envOnlyMacros } from 'vite-env-only'
import { iconsSpritesheet } from 'vite-plugin-icons-spritesheet'

const MODE = process.env.NODE_ENV

export default defineConfig({
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
			// The generated file lives where the @/icon-name alias already
			// points, so the alias in tsconfig.json does not have to move.
			typesOutputFile: './app/components/ui/icons/name.d.ts',
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
						filesToDeleteAfterUpload: [
							'./build/**/*.map',
							'.server-build/**/*.map',
						],
					},
				})
			: null,
	],
})
