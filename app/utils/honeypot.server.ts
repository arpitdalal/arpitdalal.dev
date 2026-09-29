import { createHash } from 'node:crypto'
import { Honeypot, SpamError } from 'remix-utils/honeypot/server'

/**
 * The field names, named here rather than left to `remix-utils`' defaults so
 * that `checkHoneypot` can require them and stay in step with the config below.
 * `Honeypot` exposes both as `protected`, so there is no supported way to read
 * back what it was configured with.
 */
const NAME_FIELD_NAME = 'name__confirm'

/**
 * `null` disables the `from__confirm` half of the check, which is what the test
 * suite wants: it makes `check` return before it ever decrypts, so a case that
 * accidentally depends on the crypto fails loudly instead of passing for the
 * wrong reason. The consequence is that the input is not rendered either, so
 * the field cannot be required — see `missingHoneypotFields`.
 */
const VALID_FROM_FIELD_NAME = process.env.TESTING ? null : 'from__confirm'

export const honeypot = new Honeypot({
	nameFieldName: NAME_FIELD_NAME,
	validFromFieldName: VALID_FROM_FIELD_NAME,
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

/**
 * The honeypot fields this submission is missing, if any.
 *
 * `remix-utils` treats a form carrying *neither* honeypot field as one it has
 * no opinion about: `shouldCheckHoneypot` returns false and `check` returns
 * without throwing. That is a deliberate accommodation for forms that are not
 * protected by a honeypot at all — but on these routes every form is, and the
 * fields are rendered unconditionally by `HoneypotInputs`, so their absence
 * means the submission was not produced by our page. A bot that simply omits
 * them walks straight past the check that exists to catch it.
 *
 * Requiring `name__confirm` is what closes that. It is the field the check is
 * built around: a human cannot see it and leaves it blank, and a bot filling
 * every input it finds trips it. A submission without it has skipped the
 * question rather than answered it.
 *
 * `from__confirm` is required when it is configured, and skipped when it is
 * `null` — with the timestamp half disabled the input is not rendered, so
 * demanding it would reject every real submission in the environments that
 * disable it. Read through the module's own constant rather than
 * `honeypot.validFromFieldName`, which is `protected`.
 */
function missingHoneypotFields(formData: FormData): string[] {
	const missing: string[] = []
	if (!formData.has(NAME_FIELD_NAME)) missing.push(NAME_FIELD_NAME)
	if (VALID_FROM_FIELD_NAME && !formData.has(VALID_FROM_FIELD_NAME)) {
		missing.push(VALID_FROM_FIELD_NAME)
	}
	return missing
}

export async function checkHoneypot(formData: FormData) {
	// Checked before `honeypot.check` so a submission that skipped the fields
	// is answered without paying for the decrypt, and so the rejection is ours
	// rather than dependent on `check`'s no-op behaviour above.
	const missing = missingHoneypotFields(formData)
	if (missing.length > 0) {
		throw new Response('Form not submitted properly', { status: 400 })
	}

	try {
		await honeypot.check(formData)
	} catch (error) {
		// A `SpamError` is the expected rejection. A malformed field is the same
		// answer reached the long way round — see the note on the predicate for the
		// one case that is not really spam. Everything else is a real fault
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
