import { PassThrough } from 'node:stream'
import { styleText } from 'node:util'
import { createReadableStreamFromReadable } from '@react-router/node'
import * as Sentry from '@sentry/node'
import { isbot } from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import {
	ServerRouter,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	type HandleDocumentRequestFunction,
} from 'react-router'
import { getEnv, init } from './utils/env.server'
import { NonceProvider } from './utils/nonce-provider'
import {
	getRouteErrorCause,
	isExpectedReactRouterRouteError,
} from './utils/sentry-event-filters'
import { makeTimings } from './utils/timing.server'

export const streamTimeout = 5000

init()
global.ENV = getEnv()

type DocRequestArgs = Parameters<HandleDocumentRequestFunction>

export default async function handleRequest(...args: DocRequestArgs) {
	const [request, responseStatusCode, responseHeaders, reactRouterContext] =
		args
	responseHeaders.set('fly-region', process.env.FLY_REGION ?? 'unknown')
	responseHeaders.set('fly-app', process.env.FLY_APP_NAME ?? 'unknown')

	if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
		responseHeaders.append('Document-Policy', 'js-profiling')
	}

	const callbackName = isbot(request.headers.get('user-agent'))
		? 'onAllReady'
		: 'onShellReady'

	const nonce = request.headers.get('x-csp-nonce') ?? ''
	return new Promise(async (resolve, reject) => {
		let didError = false
		// NOTE: this timing will only include things that are rendered in the shell
		// and will not include suspended components and deferred loaders
		const timings = makeTimings('render', 'renderToPipeableStream')

		const { pipe, abort } = renderToPipeableStream(
			<NonceProvider value={nonce}>
				<ServerRouter
					context={reactRouterContext}
					url={request.url}
					nonce={nonce}
				/>
			</NonceProvider>,
			{
				[callbackName]: () => {
					const body = new PassThrough()
					responseHeaders.set('Content-Type', 'text/html')
					responseHeaders.append('Server-Timing', timings.toString())
					resolve(
						new Response(createReadableStreamFromReadable(body), {
							headers: responseHeaders,
							status: didError ? 500 : responseStatusCode,
						}),
					)
					pipe(body)
				},
				onShellError: (err: unknown) => {
					reject(err)
				},
				onError: () => {
					didError = true
				},
				nonce,
			},
		)

		setTimeout(abort, streamTimeout + 5000)
	})
}

export async function handleDataRequest(response: Response) {
	response.headers.set('fly-region', process.env.FLY_REGION ?? 'unknown')
	response.headers.set('fly-app', process.env.FLY_APP_NAME ?? 'unknown')

	return response
}

export function handleError(
	error: unknown,
	{ request }: LoaderFunctionArgs | ActionFunctionArgs,
): void {
	// Skip capturing if the request is aborted as Remix docs suggest
	// Ref: https://remix.run/docs/en/main/file-conventions/entry.server#handleerror
	if (request.signal.aborted) {
		return
	}

	// React Router hands `handleError` an `ErrorResponse` rather than an
	// `Error` for anything a route rejected, so the message and stack live on
	// `.error`. Report that instead of the wrapper, otherwise Sentry files a
	// stackless issue grouped on a synthesised message. This mirrors React
	// Router's own default handler.
	const reported = getRouteErrorCause(error)
	const logReportedError = () => {
		if (reported instanceof Error) {
			console.error(styleText('red', String(reported.stack)))
		} else {
			console.error(reported)
		}
	}

	// Bots and scanners request every URL in the sitemap with methods the
	// routes do not handle, and React Router throws for each of those. They are
	// expected answers to invalid traffic, not bugs, so they get logged (they
	// still show up in `fly logs`) but never reported to Sentry.
	if (isExpectedReactRouterRouteError(error)) {
		logReportedError()
		return
	}

	logReportedError()
	void Sentry.captureException(reported)
}
