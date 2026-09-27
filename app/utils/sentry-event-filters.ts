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

export function isExpectedReactRouterErrorMessage(message: string): boolean {
	return EXPECTED_REACT_ROUTER_ERROR_PATTERNS.some((pattern) =>
		pattern.test(message),
	)
}

/**
 * Narrows a value thrown by a loader/action to the React Router "no handler for
 * this request" errors.
 *
 * These arrive as an `ErrorResponse`, not an `Error`, so `error instanceof
 * Error` is false and `error.message` is undefined — in production the message
 * lives on `.data` as a string. Matching on the message alone would also mean
 * any unrelated error whose text happened to contain one of these phrases got
 * dropped, so the status is checked first: the messages above are only ever
 * produced alongside one of these two statuses.
 */
export function isExpectedReactRouterRouteError(error: unknown): boolean {
	if (!isRouteErrorResponse(error)) return false
	if (!EXPECTED_REACT_ROUTER_ERROR_STATUSES.includes(error.status)) return false

	// `data` is the message string in production and the underlying `Error` in
	// development.
	const { data } = error
	const message =
		typeof data === 'string'
			? data
			: data instanceof Error
				? data.message
				: null

	return message ? isExpectedReactRouterErrorMessage(message) : false
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
