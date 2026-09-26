import * as Sentry from '@sentry/node'
import { type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router'

const API_HOST = 'us.i.posthog.com'
const ASSET_HOST = 'us-assets.i.posthog.com'

type RequestInitWithDuplex = RequestInit & {
	duplex?: 'half' // needed for larger POST bodies - https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1483
}

async function posthogProxy(request: Request) {
	const url = new URL(request.url)

	const hostname = url.pathname.startsWith('/resources/ingest/static')
		? ASSET_HOST
		: API_HOST

	const newUrl = new URL(url)
	newUrl.protocol = 'https'
	newUrl.hostname = hostname
	newUrl.port = '443'
	newUrl.pathname = newUrl.pathname.replace(/^\/resources\/ingest/, '')

	const headers = new Headers(request.headers)
	headers.set('host', hostname)
	headers.delete('accept-encoding')

	const fetchOptions: RequestInitWithDuplex = {
		method: request.method,
		headers,
		redirect: 'follow',
	}

	if (!['GET', 'HEAD'].includes(request.method)) {
		fetchOptions.body = request.body
		fetchOptions.duplex = 'half'
	}

	try {
		const response = await fetch(newUrl, fetchOptions)

		// A 5xx from the relay means analytics data is being dropped. It is
		// passed through to the browser below either way, so report it here
		// rather than letting it disappear. 4xx is deliberately ignored: the
		// SDK sends legitimately rejectable payloads and flagging those would
		// bury the signal.
		if (response.status >= 500) {
			void Sentry.captureMessage('PostHog proxy upstream failure', {
				level: 'error',
				tags: { posthog_path: newUrl.pathname },
				extra: { status: response.status, statusText: response.statusText },
			})
		}

		const responseHeaders = new Headers(response.headers)
		responseHeaders.delete('content-encoding')
		responseHeaders.delete('content-length')
		responseHeaders.delete('transfer-encoding')
		responseHeaders.delete('Content-Length')

		const data =
			response.status === 304 || response.status === 204
				? null
				: await response.arrayBuffer()

		return new Response(data, {
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders,
		})
	} catch (error) {
		console.error('Proxy error:', error)
		void Sentry.captureException(error)
		return new Response('Proxy Error', { status: 500 })
	}
}

export async function loader({ request }: LoaderFunctionArgs) {
	return await posthogProxy(request)
}

export async function action({ request }: ActionFunctionArgs) {
	return await posthogProxy(request)
}
