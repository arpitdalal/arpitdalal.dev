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

/**
 * The only two media types a browser form submission can carry, and therefore
 * the only two `formData()` will accept.
 */
const FORM_MEDIA_TYPES = new Set([
	'application/x-www-form-urlencoded',
	'multipart/form-data',
])

/**
 * The body text for both rejections, so a client sees one answer regardless of
 * why its body was refused. The alternative — reporting which check failed —
 * hands a scanner a map of what this endpoint validates.
 */
const UNREADABLE_BODY = 'Form not submitted properly'

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
	// claimed to be a form — is refused without touching the body at all. A
	// body is not required to carry a `Content-Type`; a bare `curl -X POST
	// /contact` sends neither, so the header is the only place the answer to
	// "could this possibly be a form?" exists.
	//
	// That check is necessary but not sufficient, which is the bug this shape
	// exists to close. `multipart/form-data` carries its boundary as a header
	// *parameter*, and `formData()` throws when it is missing — so a request
	// that declares a media type we accept can still be unreadable. Enumerating
	// the headers that produce a parse failure is not a fix; it is a list of
	// today's, and undici is free to reject a body for a reason nobody
	// enumerated. So every throw from the parse itself is caught and answered the
	// same way, which holds regardless of which reason it was.
	//
	// Only a `TypeError` is converted. `formData()` signals an unparseable body
	// with one, and it is the only thing it throws for this input; anything else
	// (a `File` handle that cannot be read, say) is a fault on this side of the
	// wire and still belongs in Sentry.
	try {
		const mediaType = request.headers
			.get('content-type')
			?.split(';', 1)[0]
			?.trim()
			.toLowerCase()

		if (!mediaType || !FORM_MEDIA_TYPES.has(mediaType)) {
			throw new Response(UNREADABLE_BODY, { status: 400 })
		}

		return await request.formData()
	} catch (error) {
		if (error instanceof TypeError) {
			throw new Response(UNREADABLE_BODY, { status: 400 })
		}
		throw error
	}
}
