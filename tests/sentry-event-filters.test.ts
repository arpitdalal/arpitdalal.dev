import { describe, expect, it } from 'vitest'
import {
	EXPECTED_REACT_ROUTER_ERROR_PATTERNS,
	getEventErrorMessages,
	isExpectedReactRouterErrorMessage,
	shouldDropErrorEvent,
} from '#app/utils/sentry-event-filters'

describe('isExpectedReactRouterErrorMessage', () => {
	it('matches a request with no matching action', () => {
		expect(
			isExpectedReactRouterErrorMessage(
				'You made a POST request to "/" but did not provide an `action` for route "root", so there is no way to handle the request.',
			),
		).toBe(true)
	})

	it('matches a request with no matching loader', () => {
		expect(
			isExpectedReactRouterErrorMessage(
				'You made a GET request to "/resources/theme-switch" but did not provide a `loader` for route "routes/resources/theme-switch", so there is no way to handle the request.',
			),
		).toBe(true)
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
			shouldDropErrorEvent({
				exception: {
					values: [
						{
							value:
								'You made a POST request to "/" but did not provide an `action` for route "root", so there is no way to handle the request.',
						},
					],
				},
			}),
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
