/**
 * Body parsing for the two public form actions, `/contact` and
 * `/resources/newsletter`.
 *
 * `request.formData()` is not a parser that can fail softly: it throws a
 * `TypeError` from undici the moment the `Content-Type` is not
 * `multipart/form-data` or `application/x-www-form-urlencoded`, and it throws it
 * while reading the body, which is *before* any of the action's own code runs.
 * That put a bare 500 in Sentry for every `POST /contact` that arrived with a
 * JSON body, no body at all, or a `Content-Type` a scanner made up — the kind of
 * traffic a public form URL collects continuously.
 *
 * Two things were wrong with that, and this fixes the first:
 *
 * 1. It answered 500, which is a claim that the server broke. The request was
 *    not understood, not mishandled, so 400 is the truthful answer.
 * 2. It reached Sentry at all. It threw ahead of `checkHoneypot`, so the 400
 *    path in `honeypot.server.ts` — the one that already exists precisely so
 *    junk traffic is cheap and silent — never got a look at it.
 *
 * The alternative of dropping the message in `sentry-event-filters.ts` is not
 * enough on its own: it hides the symptom while the endpoint keeps answering 500
 * and keeps throwing on every such request.
 */

import { REJECTED_SUBMISSION } from '#app/utils/rejected-submission'

/**
 * The only two media types a browser form submission can carry, and therefore
 * the only two `formData()` will accept.
 */
const FORM_MEDIA_TYPES = new Set([
	'application/x-www-form-urlencoded',
	'multipart/form-data',
])

/**
 * Whether `error` is a `TypeError`, the way this repo reads a cross-realm class
 * everywhere else.
 *
 * `instanceof` would work here — this runs once per request on the server,
 * which is single-realm — but `isMalformedHoneypotFieldError` in
 * `honeypot.server.ts` deliberately reads `Symbol.toStringTag` for the same
 * reason and documents why, and two ways of asking the same question in one
 * change is how the wrong one gets copied. The tag is correct in every realm.
 */
function isTypeError(error: unknown): boolean {
	return (
		Object.prototype.toString.call(error) === '[object Error]' &&
		(error as Error).name === 'TypeError'
	)
}

/**
 * Reads the request body as `FormData`, or answers 400.
 *
 * Throwing a `Response` is the same contract `checkHoneypot` uses for junk, so
 * both failure modes on these routes land as a 400 that React Router turns into
 * a status code rather than an unhandled exception.
 *
 * Deliberately not logged. This is scanner traffic, it is unbounded, and an
 * unparseable body is not information the operator can act on — the honeypot's
 * own 400 is silent for the same reason.
 */
export async function readFormData(request: Request): Promise<FormData> {
	// Two separate rejections, because there are two separate ways the body can
	// be unreadable, and only the second one is visible from inside `formData()`.
	//
	// The media type is checked first so the common case — a request that never
	// claimed to be a form — is refused without touching the body at all. A body
	// is not required to carry a `Content-Type`; a bare `curl -X POST /contact`
	// sends neither, so the header is the only place the answer to "could this
	// possibly be a form?" exists.
	//
	// That check is necessary but not sufficient, which is the bug this shape
	// exists to close. `multipart/form-data` carries its boundary as a header
	// *parameter*, and `formData()` rejects when it is missing — so a request
	// declaring a media type we accept can still be unreadable. Enumerating the
	// headers that produce a parse failure would not be a fix, it would be a
	// list of today's, and the spec only requires a `TypeError` for "fails for
	// some reason". So the parse itself is wrapped and every `TypeError` it
	// throws is answered the same way, which holds whatever the reason was.
	//
	// The allowlist is a second source of truth, deliberately: measured across
	// the header variants a real client can send, it rejects nothing
	// `formData()` would have accepted. What it buys is refusing without
	// reading the body, and what it costs is that a third form encoding would
	// have to be added here in step with undici or real users get a 400.
	try {
		const mediaType = request.headers
			.get('content-type')
			?.split(';', 1)[0]
			?.trim()
			.toLowerCase()

		if (!mediaType || !FORM_MEDIA_TYPES.has(mediaType)) {
			throw new Response(REJECTED_SUBMISSION, { status: 400 })
		}

		// A body already read or locked is *our* bug rather than the client's —
		// something upstream consumed it — and it rejects with a `TypeError` too,
		// which is exactly the signal the catch below converts. `bodyUsed` is the
		// spec'd way to tell the two apart ("whether the body has been read
		// from", https://fetch.spec.whatwg.org/#dom-body), and it is the one part
		// of this that is not a judgement call: without it a double read would be
		// filed as a rejected submission and never surface at all.
		if (request.bodyUsed) {
			throw new Error(
				'readFormData: the request body was already consumed before the action read it',
			)
		}

		return await request.formData()
	} catch (error) {
		// `formData()` signals an unreadable body with a `TypeError` in every
		// case the spec names — an undeterminable or non-form MIME type, a
		// decoding failure, a body it cannot parse — and the spec requires
		// nothing else for this input. So this is the whole of "the client sent
		// something we cannot read". Anything else is a fault on this side of
		// the wire and still belongs in Sentry.
		if (isTypeError(error)) {
			throw new Response(REJECTED_SUBMISSION, { status: 400 })
		}
		throw error
	}
}
