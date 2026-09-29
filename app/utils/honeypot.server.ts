import { createHash } from 'node:crypto'
import { Honeypot, SpamError } from 'remix-utils/honeypot/server'
import { REJECTED_SUBMISSION } from '#app/utils/rejected-submission'

/**
 * A `Honeypot` that never treats a form as exempt.
 *
 * `remix-utils` has `shouldCheckHoneypot` return false — and `check` return
 * without throwing — for a form carrying neither honeypot field. That is the
 * right default for a library: a route with no honeypot should not be forced to
 * carry one. But every form on the routes that use this module renders
 * `HoneypotInputs` unconditionally, so a form without the fields cannot have
 * come from our page, and silently accepting it means a bot skips the check
 * that exists to catch it just by leaving the fields out.
 *
 * `protected` is the library marking this as an extension point, so overriding
 * it is the supported way to be strict. It gets the behaviour through the
 * library's own `SpamError` path rather than a second, parallel implementation
 * of the same rule — the previous version of this file checked for the fields
 * itself and had to hardcode their names to do it, which is what made it drift.
 *
 * The field names are read from the base class rather than repeated here. They
 * are `protected` rather than private precisely so a subclass can reach them,
 * and reading them keeps the requirement true under
 * `randomizeNameFieldName`, where the name is suffixed per request and a
 * hardcoded `name__confirm` would reject every genuine submission.
 */
class StrictHoneypot extends Honeypot {
	/**
	 * Always run the check. Returning `true` makes `check` reject a form
	 * missing `name__confirm` as a `SpamError` through its existing
	 * "Missing honeypot input" branch.
	 */
	protected override shouldCheckHoneypot() {
		return true
	}

	/** The fields a form must carry to be checked at all, in configured order. */
	get requiredFieldNames(): string[] {
		const names = [this.nameFieldName]
		// `null` means the timestamp half is disabled, and the input is not
		// rendered when it is — so it cannot be required.
		if (this.validFromFieldName) names.push(this.validFromFieldName)
		return names
	}
}

/**
 * `validFromFieldName` is left exactly as it was — `undefined` normally, `null`
 * under `TESTING` — because `requiredFieldNames` reads back whatever the
 * instance was configured with rather than restating it. Nothing here depends
 * on which branch is taken, so there is no env var to arrange to reach the
 * crypto path, and the two cannot drift.
 *
 * Note for anyone reading `tests/honeypot.test.ts` next: `vi.stubEnv('TESTING',
 * '')` sets the empty string, which is *falsy*, so the suite runs with the
 * timestamp half **enabled**. That is what makes the `from__confirm` cases
 * meaningful rather than no-ops, and it is why that file no longer claims
 * otherwise.
 */
export const honeypot = new StrictHoneypot({
	encryptionSeed: process.env.HONEYPOT_SECRET,
	validFromFieldName: process.env.TESTING ? null : undefined,
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
 * Redundant with the check itself — `StrictHoneypot` already rejects a form
 * that omits them — and kept because it is where the rejection *message* is
 * chosen. The library says which field it wanted; this answers that the
 * submission is not one we issued. Both are the same 400, so nothing
 * observable depends on the wording.
 */
function missingHoneypotFields(formData: FormData): string[] {
	return honeypot.requiredFieldNames.filter((name) => !formData.has(name))
}

export async function checkHoneypot(formData: FormData) {
	// Checked before `honeypot.check` so a submission that skipped the fields is
	// answered without paying for the decrypt.
	if (missingHoneypotFields(formData).length > 0) {
		throw new Response(REJECTED_SUBMISSION, { status: 400 })
	}

	try {
		await honeypot.check(formData)
	} catch (error) {
		// A `SpamError` is the expected rejection. A malformed field is the same
		// answer reached the long way round — see the note on the predicate for the
		// one case that is not really spam. Everything else is a real fault
		// and stays a 500.
		if (error instanceof SpamError || isMalformedHoneypotFieldError(error)) {
			throw new Response(REJECTED_SUBMISSION, { status: 400 })
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
