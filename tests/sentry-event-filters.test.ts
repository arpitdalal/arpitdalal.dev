import { UNSAFE_ErrorResponseImpl as ErrorResponseImpl } from 'react-router'
import { describe, expect, it } from 'vitest'
import {
	EXPECTED_REACT_ROUTER_ERROR_PATTERNS,
	getEventErrorMessages,
	isExpectedReactRouterErrorMessage,
	isExpectedReactRouterRouteError,
	shouldDropErrorEvent,
} from '#app/utils/sentry-event-filters'

const NO_ACTION =
	'You made a POST request to "/robots.txt" but did not provide an `action` for route "routes/_seo+/robots[.]txt", so there is no way to handle the request.'
const NO_LOADER =
	'You made a GET request to "/resources/theme-switch" but did not provide a `loader` for route "routes/resources/theme-switch", so there is no way to handle the request.'

describe('isExpectedReactRouterErrorMessage', () => {
	it('matches a request with no matching action', () => {
		expect(isExpectedReactRouterErrorMessage(NO_ACTION)).toBe(true)
	})

	it('matches a request with no matching loader', () => {
		expect(isExpectedReactRouterErrorMessage(NO_LOADER)).toBe(true)
	})

	it('matches an unsupported request method', () => {
		expect(
			isExpectedReactRouterErrorMessage('Invalid request method "OPTIONS"'),
		).toBe(true)
	})

	it('does not match an unrelated error', () => {
		expect(
			isExpectedReactRouterErrorMessage('Database connection failed'),
		).toBe(false)
		expect(isExpectedReactRouterErrorMessage('')).toBe(false)
		expect(
			isExpectedReactRouterErrorMessage('Error: getServerSideProps failed'),
		).toBe(false)
	})

	// The `action`/`loader` patterns are unanchored, which is what lets them
	// survive React Router rewording the surrounding text between versions. The
	// cost is that a genuine bug whose message happens to contain the phrase is
	// dropped too. That is inherited from upstream deliberately: React Router's
	// own message is not part of its public API, so anchoring is not an option.
	it('matches unanchored, so a real error containing the phrase is dropped too', () => {
		expect(
			isExpectedReactRouterErrorMessage(
				'Newsletter route did not provide an `action` handler',
			),
		).toBe(true)
	})

	it('exposes its patterns for callers that want to inspect them', () => {
		expect(EXPECTED_REACT_ROUTER_ERROR_PATTERNS).toHaveLength(3)
	})
})

describe('getEventErrorMessages', () => {
	it('collects the top-level message', () => {
		expect(getEventErrorMessages({ message: 'boom' })).toEqual(['boom'])
	})

	it('collects every exception value, skipping empty ones', () => {
		expect(
			getEventErrorMessages({
				exception: { values: [{ value: 'first' }, { value: null }, {}] },
			}),
		).toEqual(['first'])
	})

	it('returns the exception values before the message', () => {
		expect(
			getEventErrorMessages({
				message: 'top',
				exception: { values: [{ value: 'nested' }] },
			}),
		).toEqual(['nested', 'top'])
	})

	it('tolerates a missing or null exception', () => {
		expect(getEventErrorMessages({})).toEqual([])
		expect(getEventErrorMessages({ exception: null })).toEqual([])
		expect(getEventErrorMessages({ exception: { values: null } })).toEqual([])
	})
})

describe('shouldDropErrorEvent', () => {
	it('drops an event whose exception value is an expected router error', () => {
		expect(
			shouldDropErrorEvent({ exception: { values: [{ value: NO_ACTION }] } }),
		).toBe(true)
	})

	it('drops an event whose message is an expected router error', () => {
		expect(
			shouldDropErrorEvent({ message: 'Invalid request method "TRACE"' }),
		).toBe(true)
	})

	it('keeps an event that is a real failure', () => {
		expect(
			shouldDropErrorEvent({
				exception: { values: [{ value: 'Unexpected server failure' }] },
			}),
		).toBe(false)
		expect(shouldDropErrorEvent({})).toBe(false)
	})
})

describe('isExpectedReactRouterRouteError', () => {
	// React Router reports these as an `ErrorResponse`, not an `Error`, so
	// `error instanceof Error` is false and `error.message` is undefined. A
	// filter written against `instanceof Error` silently never fires.
	const routeError = (status: number, data: unknown) =>
		new ErrorResponseImpl(status, 'status', data, true)

	it('matches a 405 with no matching action', () => {
		expect(isExpectedReactRouterRouteError(routeError(405, NO_ACTION))).toBe(
			true,
		)
	})

	it('matches a 400 with no matching loader', () => {
		expect(isExpectedReactRouterRouteError(routeError(400, NO_LOADER))).toBe(
			true,
		)
	})

	it('matches an unsupported method', () => {
		expect(
			isExpectedReactRouterRouteError(
				routeError(405, 'Invalid request method "OPTIONS"'),
			),
		).toBe(true)
	})

	it('matches when data is an Error, as it is in development', () => {
		expect(
			isExpectedReactRouterRouteError(routeError(405, new Error(NO_ACTION))),
		).toBe(true)
	})

	it('does not match a route error with another status', () => {
		expect(isExpectedReactRouterRouteError(routeError(404, NO_ACTION))).toBe(
			false,
		)
		expect(isExpectedReactRouterRouteError(routeError(500, NO_ACTION))).toBe(
			false,
		)
	})

	it('does not match a real error whose text contains the phrase', () => {
		// The patterns are unanchored, so the status check is what keeps a
		// genuine failure reportable.
		expect(
			isExpectedReactRouterRouteError(
				new Error('newsletter route did not provide an `action` handler'),
			),
		).toBe(false)
		expect(isExpectedReactRouterRouteError(routeError(500, NO_ACTION))).toBe(
			false,
		)
	})

	it('does not match values that are not route errors', () => {
		expect(isExpectedReactRouterRouteError(undefined)).toBe(false)
		expect(isExpectedReactRouterRouteError(null)).toBe(false)
		expect(isExpectedReactRouterRouteError(NO_ACTION)).toBe(false)
		expect(isExpectedReactRouterRouteError({ status: 405 })).toBe(false)
		expect(isExpectedReactRouterRouteError(routeError(405, undefined))).toBe(
			false,
		)
	})
})
