import { NotFound, dinoCssLinks } from '#app/components/error-boundary'

export const links = () => [...dinoCssLinks()]

export async function loader() {
	throw new Response('Not found', { status: 404 })
}

export function action() {
	throw new Response('Not found', { status: 404 })
}

export default NotFound

export function ErrorBoundary() {
	return <NotFound />
}
