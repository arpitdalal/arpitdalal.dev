import { UNSAFE_ErrorResponseImpl as ErrorResponseImpl } from 'react-router'
import { describe, expect, it } from 'vitest'
import { isRejectedSubmission } from '#app/components/error-boundary'
import { REJECTED_SUBMISSION } from '#app/utils/rejected-submission'

/**
 * `isRejectedSubmission` decides whether a route error reaches Sentry, so it is
 * worth pinning on both sides: a submission the site refuses on purpose must
 * stay out of Sentry, and everything else must not be silenced by accident.
 *
 * This matters more than it looks. A thrown `Response` is how both form guards
 * answer a submission they will not accept, and React Router turns one into an
 * `ErrorResponse` at the nearest boundary exactly as it does for a crash — so
 * without this distinction every rejected submission was reported from the
 * browser, with `replaysOnErrorSampleRate: 1.0` attaching a session replay to
 * whoever happened to submit it. The newsletter form is in the footer of every
 * page, so a single stray POST was enough.
 */

function routeErrorResponse(data: unknown, status = 400) {
	return new ErrorResponseImpl(status, statusText(status), data)
}

function statusText(status: number) {
	return status === 400 ? 'Bad Request' : 'OK'
}

describe('isRejectedSubmission', () => {
	it('recognises the 400 the form guards throw', () => {
		expect(isRejectedSubmission(routeErrorResponse(REJECTED_SUBMISSION))).toBe(
			true,
		)
	})

	// The narrowing that stops this from becoming "ignore every 400". React
	// Router raises 400 itself for a request with no matching loader, which on a
	// public site is a scanner probing for routes, and `sentry-event-filters.ts`
	// already drops that server-side. Reporting it here would undo that work, so
	// the match is on the shared body rather than the status.
	it('does not claim a 400 the router raised itself', () => {
		expect(
			isRejectedSubmission(
				routeErrorResponse('No route matches URL "/wp-admin"', 400),
			),
		).toBe(false)
	})

	it('does not claim a 500 that happens to carry the same text', () => {
		expect(
			isRejectedSubmission(routeErrorResponse(REJECTED_SUBMISSION, 500)),
		).toBe(false)
	})

	it('does not claim a real error', () => {
		expect(isRejectedSubmission(new Error(REJECTED_SUBMISSION))).toBe(false)
		expect(isRejectedSubmission(new TypeError(REJECTED_SUBMISSION))).toBe(false)
	})

	it('is not fooled by a plain object that looks like an error response', () => {
		// `isRouteErrorResponse` checks the prototype, not the shape. Matching on
		// shape instead would let anything on the page suppress its own reporting.
		expect(
			isRejectedSubmission({ status: 400, data: REJECTED_SUBMISSION }),
		).toBe(false)
		expect(isRejectedSubmission(undefined)).toBe(false)
		expect(isRejectedSubmission(null)).toBe(false)
	})
})
