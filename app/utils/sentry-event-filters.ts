/**
 * Pure helpers for dropping expected Sentry noise from a public site — the
 * bots and scanners that hit `/sitemap.xml` and then request every path in it
 * with methods the routes do not handle.
 *
 * React Router throws a 405-style error for a request with no matching
 * `loader` or `action`, and for unsupported request methods. Those are expected
 * answers to invalid traffic, not bugs, so they should not page anyone.
 *
 * NOTE: Healthcheck noise is *not* handled here. `server/utils/monitoring.ts`
 * drops those transactions in its `tracesSampler` and the client sets
 * `denyUrls`, so a filter for them would be dead code.
 */

import { isRouteErrorResponse } from 'react-router'

export const EXPECTED_REACT_ROUTER_ERROR_PATTERNS = [
	/did not provide an `action`/i,
	/did not provide a `loader`/i,
	/^Invalid request method /i,
]

/**
 * The only statuses React Router uses for these three errors: 400 for a request
 * with no matching `loader`, 405 for no matching `action` or an unsupported
 * method.
 */
const EXPECTED_REACT_ROUTER_ERROR_STATUSES = [400, 405]

/**
 * React Router's message arrives either bare (`Error.message`) or stringified
 * (`String(error)`, which is what `.data` holds on the document path). The
 * latter is prefixed with the error's name, which breaks the anchored
 * `^Invalid request method` pattern. Strip it before matching so the patterns
 * can stay anchored to the message itself.
 */
function stripErrorNamePrefix(message: string): string {
	return message.replace(/^\w*Error:\s*/, '')
}

export function isExpectedReactRouterErrorMessage(message: string): boolean {
	return EXPECTED_REACT_ROUTER_ERROR_PATTERNS.some((pattern) =>
		pattern.test(message),
	)
}

/**
 * The `Error` behind a route error, when React Router kept one.
 *
 * `ErrorResponseImpl.error` is marked private, but it is what React Router's
 * own default `handleError` reads and it holds the real message and stack.
 * Handing the wrapper to Sentry instead files a stackless issue grouped on a
 * synthesised message.
 */
export function getRouteErrorCause(error: unknown): unknown {
	if (!isRouteErrorResponse(error)) return error
	return (error as { error?: unknown }).error ?? error
}

/**
 * Narrows a value thrown by a loader/action to the React Router "no handler for
 * this request" errors.
 *
 * These arrive as an `ErrorResponse`, not an `Error`, so `error instanceof
 * Error` is false and `error.message` is undefined — in production the message
 * lives on `.data` as a string. Matching on the message alone would also mean
 * any unrelated error whose text happened to contain one of these phrases got
 * dropped, so the status and the `internal` flag are checked first: the
 * messages above are only ever produced alongside one of these two statuses, on
 * an error React Router raised itself.
 */
export function isExpectedReactRouterRouteError(error: unknown): boolean {
	if (!isRouteErrorResponse(error)) return false
	// `internal: true` is how React Router marks the errors it generated itself
	// (see `getInternalRouterError`). A route that throws its own 400/405 is
	// marked `internal: false`, and that is a real bug worth reporting even if
	// its text happens to contain one of the phrases below.
	if ((error as { internal?: unknown }).internal !== true) return false
	if (!EXPECTED_REACT_ROUTER_ERROR_STATUSES.includes(error.status)) return false

	// `.data` carries the message two ways. React Router wraps it in an `Error`
	// (see `getInternalRouterError` in react-router's router.js) and unwraps it
	// again when it renders a document, so the document path yields a
	// stringified error; the single-fetch path yields the `Error`. Accept both.
	const { data } = error
	const message =
		typeof data === 'string'
			? data
			: data instanceof Error
				? data.message
				: null

	return message
		? isExpectedReactRouterErrorMessage(stripErrorNamePrefix(message))
		: false
}

type ErrorEventLike = {
	message?: string
	exception?: { values?: Array<{ value?: string | null } | null> | null } | null
}

export function getEventErrorMessages(event: ErrorEventLike): string[] {
	const messages: string[] = []
	for (const value of event.exception?.values ?? []) {
		if (value?.value) messages.push(value.value)
	}
	if (event.message) messages.push(event.message)
	return messages
}

export function shouldDropErrorEvent(event: ErrorEventLike): boolean {
	return getEventErrorMessages(event).some(isExpectedReactRouterErrorMessage)
}
