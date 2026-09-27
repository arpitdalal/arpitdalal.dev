import { useRouteLoaderData } from 'react-router'
import { type loader as rootLoader } from '#app/root'

/**
 * @returns the request info from the root loader, or `undefined` when the root
 * loader never ran.
 *
 * That second case is not hypothetical. React Router short-circuits a request
 * with no matching `loader`/`action`, or with an unsupported method, *before*
 * any loader runs — so for a 400/405 there is no root data, yet the document
 * (and therefore the error boundary) still has to render. Asserting the data is
 * present here turned every such request into a 500 with the real cause
 * buried, so callers degrade instead.
 */
export function useRequestInfo() {
	return useRouteLoaderData<typeof rootLoader>('root')?.requestInfo
}
