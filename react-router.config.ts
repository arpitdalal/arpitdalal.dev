import { type Config } from '@react-router/dev/config'

export default {
	// Defaults to true. Set to false to enable SPA for all routes.
	ssr: true,

	// This is a small site (12 routes). Opting out of lazy route discovery
	// ships the whole route manifest with the initial HTML document, which
	// removes a round-trip on every client-side navigation.
	routeDiscovery: { mode: 'initial' },

	// `future.v8_splitRouteModules` moved to the top level in v8 and defaults to
	// true, so the explicit `splitRouteModules: true` is redundant.
	// `v8_viteEnvironmentApi` is gone — the Vite Environment API is always on.
	future: {
		unstable_optimizeDeps: true,
	},
} satisfies Config
