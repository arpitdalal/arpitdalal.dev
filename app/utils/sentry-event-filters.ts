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

export const EXPECTED_REACT_ROUTER_ERROR_PATTERNS = [
	/did not provide an `action`/i,
	/did not provide a `loader`/i,
	/^Invalid request method /i,
]

export function isExpectedReactRouterErrorMessage(message: string): boolean {
	return EXPECTED_REACT_ROUTER_ERROR_PATTERNS.some((pattern) =>
		pattern.test(message),
	)
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
