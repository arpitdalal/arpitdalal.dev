import { createHash } from 'node:crypto'
import { Honeypot, SpamError } from 'remix-utils/honeypot/server'

export const honeypot = new Honeypot({
	validFromFieldName: process.env.TESTING ? null : undefined,
	encryptionSeed: process.env.HONEYPOT_SECRET,
})

/**
 * The two `DOMException` names a junk `from__confirm` provokes:
 * `InvalidCharacterError` when `atob` rejects the string, and `OperationError`
 * when AES-GCM rejects what the string decoded to.
 */
const MALFORMED_FIELD_ERROR_NAMES = new Set([
	'InvalidCharacterError',
	'OperationError',
])

/**
 * Whether `error` is the crypto layer choking on a `from__confirm` value, which
 * makes it spam rather than a bug.
 *
 * `remix-utils` decrypts the field before it validates it, with no shape check
 * in between, so a bot that fills the honeypot with junk takes the request down
 * before any validation runs: `atob` rejects a value outside the base64
 * alphabet, and a value that decodes to too few bytes for AES-GCM's IV and GCM
 * tag leaves it with nothing it can authenticate.
 *
 * Matched on the class *and* `.name`, never on `.message`, which is not even
 * stable within one Node version — `atob('!!!')` and `atob('a')` raise
 * different text on the Node 26 in `engines`, and the "The provided data is too
 * small" that production reported before this fix is not the text the same call
 * produces today. The name is spec'd and held across the range.
 *
 * `DOMException` is a cross-realm class, so the class is read through the
 * `Symbol.toStringTag` WebIDL puts on the interface rather than `instanceof`.
 * The server is single-realm and `instanceof` would hold there; the test
 * environment is not — vitest's jsdom global hands this module jsdom's
 * `DOMException` while `atob` and `crypto.subtle` remain Node's — so
 * `instanceof` misses exactly the two errors handled here. The tag is correct
 * in both.
 *
 * Narrowed on purpose, because a `DOMException` outside this set still has to
 * surface: `DataError` and `NotSupportedError` are the failures a real key or
 * algorithm problem would raise, and dressing those up as spam would hide a
 * genuine fault. Two limits are worth knowing about. This cannot tell *where*
 * inside `check` the error came from, so a `DOMException` with either name
 * raised by anything else in that call tree is downgraded too — today `atob`
 * and `crypto.subtle` are the only things in there that throw. And an
 * `OperationError` from a failed authentication tag is indistinguishable from
 * a short one, so a `from__confirm` we *did* issue that no longer decrypts
 * lands here as well; keeping `HONEYPOT_SECRET` stable across deploys is what
 * prevents that, and it is a required env var validated at boot.
 */
export function isMalformedHoneypotFieldError(error: unknown) {
	return (
		Object.prototype.toString.call(error) === '[object DOMException]' &&
		MALFORMED_FIELD_ERROR_NAMES.has((error as DOMException).name)
	)
}

export async function checkHoneypot(formData: FormData) {
	try {
		await honeypot.check(formData)
	} catch (error) {
		// A `SpamError` is the expected rejection. A malformed field is the same
		// answer reached the long way round — see the note on the predicate for
		// the one case that is not really spam. Everything else is a real fault
		// and stays a 500.
		if (error instanceof SpamError || isMalformedHoneypotFieldError(error)) {
			throw new Response('Form not submitted properly', { status: 400 })
		}
		throw error
	}
}

/**
 * Log a short fingerprint of the encryption seed, once, at boot.
 *
 * `checkHoneypot` answers 400 for a `from__confirm` it cannot decrypt. That is
 * right for junk, and it is also true — silently, with nothing in Sentry —
 * for a token this server issued before `HONEYPOT_SECRET` changed, because a
 * failed authentication tag and a ciphertext too short to authenticate are the
 * same `OperationError`. The two are indistinguishable where the failure
 * happens, so the boot log is the only place a rotation is visible: two
 * consecutive deploys printing different fingerprints is the signal.
 *
 * Eight hex characters is enough to tell two secrets apart and useless for
 * recovering either. Called after `init()`, so the seed is known good by then;
 * the unset branch is only here because `Honeypot` falls back to a random
 * per-process seed, which would break every token the moment a second process
 * existed.
 */
export function logHoneypotSeedFingerprint() {
	const seed = process.env.HONEYPOT_SECRET
	if (!seed) {
		console.warn(
			'⚠️ HONEYPOT_SECRET is unset. The honeypot is using a per-process random seed, so a from__confirm issued by one process will not verify in another.',
		)
		return
	}
	const fingerprint = createHash('sha256')
		.update(seed)
		.digest('hex')
		.slice(0, 8)
	console.info(`honeypot seed fingerprint: ${fingerprint}`)
}
