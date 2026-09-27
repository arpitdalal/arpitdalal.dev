declare module 'virtual:react-router/server-build' {
	import { type ServerBuild } from 'react-router'

	/**
	 * React Router resolves this to the generated server build inside the
	 * server bundle, and re-exports the ServerBuild fields as named exports.
	 * There is deliberately no default export declared: the generated module
	 * does not provide one, so `import build from 'virtual:...'` would
	 * type-check here and then be undefined at runtime.
	 *
	 * @react-router/dev documents the module for custom servers but ships no
	 * ambient types for it, so they are declared here against ServerBuild.
	 */
	export const routes: ServerBuild['routes']
	export const assets: ServerBuild['assets']
	export const assetsBuildDirectory: ServerBuild['assetsBuildDirectory']
	export const basename: ServerBuild['basename']
	export const entry: ServerBuild['entry']
	export const future: ServerBuild['future']
	export const isSpaMode: ServerBuild['isSpaMode']
	export const prerender: ServerBuild['prerender']
	export const publicPath: ServerBuild['publicPath']
	export const routeDiscovery: ServerBuild['routeDiscovery']
	export const ssr: ServerBuild['ssr']
	export const allowedActionOrigins: ServerBuild['allowedActionOrigins']
}
