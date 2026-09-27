import { Honeypot, SpamError } from 'remix-utils/honeypot/server'

export const honeypot = new Honeypot({
	validFromFieldName: process.env.TESTING ? null : undefined,
	encryptionSeed: process.env.HONEYPOT_SECRET,
})

/**
 * The `DOMException` names `atob` raises on a string outside the base64
 * alphabet and `crypto.subtle.decrypt` raises when the buffer is too small to
 * hold an IV plus a GCM tag.
 */
const MALFORMED_FIELD_ERROR_NAMES = new Set([
	'InvalidCharacterError',
	'OperationError',
])

/**
 * Whether `error` is the crypto layer choking on a `from__confirm` value we
 * never issued — which makes it spam, not a bug.
 *
 * `remix-utils` decrypts the field before it validates it, with no shape check
 * in between, so a bot that fills the honeypot with junk takes down the
 * request: `atob` rejects the string outright, or decodes it to fewer than 12
 * bytes, leaving AES-GCM with an empty ciphertext to reject. Either way the
 * submission is something we did not issue and deserves the same 400 a
 * `SpamError` gets, rather than an unhandled exception that Sentry reports on
 * attacker-controlled input.
 *
 * Matched on the class *and* `.name`, never on `.message`: the message text
 * comes from the Node version's bundled undici and changes across releases.
 */
export function isMalformedHoneypotFieldError(error: unknown) {
	// `DOMException` is a cross-realm class. The instances `atob` and
	// `crypto.subtle` throw belong to the runtime's realm, not to this module's
	// global, so `instanceof DOMException` is false for exactly the errors
	// being handled here. The `toString` tag is the cross-realm-safe read of
	// the class; narrowing further on `.name` keeps a real crypto failure
	// (`DataError`, `NotSupportedError`, …) reporting as itself.
	return (
		Object.prototype.toString.call(error) === '[object DOMException]' &&
		MALFORMED_FIELD_ERROR_NAMES.has((error as DOMException).name)
	)
}

export async function checkHoneypot(formData: FormData) {
	try {
		await honeypot.check(formData)
	} catch (error) {
		if (error instanceof SpamError) {
			throw new Response('Form not submitted properly', { status: 400 })
		}
		if (isMalformedHoneypotFieldError(error)) {
			throw new Response('Form not submitted properly', { status: 400 })
		}
		throw error
	}
}
