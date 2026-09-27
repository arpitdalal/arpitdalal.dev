import { type Config } from '@react-router/dev/config'

export default {
	// Defaults to true, but stated explicitly because it is load-bearing rather
	// than decorative: @react-router/dev reads it to pick the Vite `appType`
	// (its own plugin value wins over the one server/index.ts passes, and only
	// resolves to 'spa' when ssr is false) and to force routeDiscovery to
	// 'initial'. Setting this to false would flip both at once.
	ssr: true,

	// The default is 'lazy' (fog of war), which ships only the matched routes
	// and lets React Router discover the rest through a batched request that
	// prefetches every <Link> on the page. 'initial' trades that away: the full
	// route manifest is inlined into every HTML document instead of being a
	// separate content-hashed, immutable asset cached once and reused.
	//
	// Worth it here because the manifest is 15 routes — a rounding error beside
	// the document — so no navigation ever waits on a manifest request. Flip it
	// back to 'lazy' if the route count grows or the HTML starts being
	// edge-cached, since then the manifest is the thing that benefits from
	// being cached on its own.
	routeDiscovery: { mode: 'initial' },

	// `future.v8_splitRouteModules` moved to the top level in v8 and defaults to
	// true, so the explicit `splitRouteModules: true` is redundant.
	// `v8_viteEnvironmentApi` is gone — the Vite Environment API is always on.
	future: {
		unstable_optimizeDeps: true,
	},
} satisfies Config
