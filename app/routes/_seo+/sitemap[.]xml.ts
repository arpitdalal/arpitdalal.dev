import { generateSitemap } from '@nasa-gcn/remix-seo'
import { routes as serverRoutes } from 'virtual:react-router/server-build'
import { getDomainUrl } from '#app/utils/misc'
import { type Route } from './+types/sitemap[.]xml'

const SITEMAP_CACHE_DURATION = 60 * 5 // 5 minutes in seconds

export function loader({ request }: Route.LoaderArgs) {
	// generateSitemap needs React Router's server route manifest. It used to
	// arrive as `context.serverBuild`, but React Router 8 requires
	// getLoadContext to return a RouterContextProvider, and a createContext()
	// symbol cannot be shared between server/index.ts and the app because Node
	// and Vite produce separate module graphs, so each side would hold a
	// different context object. Reading the manifest straight out of the server
	// build keeps it inside the app's own module graph instead.
	return generateSitemap(request, serverRoutes, {
		siteUrl: getDomainUrl(request),
		headers: {
			'Cache-Control': `public, max-age=${SITEMAP_CACHE_DURATION}`,
		},
	})
}
