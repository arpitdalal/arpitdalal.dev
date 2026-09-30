import { SpamError } from 'remix-utils/honeypot/server'
import { afterAll, describe, expect, it, vi } from 'vitest'

/**
 * `remix-utils` decrypts the honeypot's `from__confirm` field before it
 * validates it, with no shape check in between, so anything a bot puts there
 * throws out of `check` as a `DOMException` rather than a `SpamError`:
 *
 * - not base64 at all → `atob` throws `InvalidCharacterError`
 * - base64, but decoding to less than an IV plus a GCM tag → AES-GCM has
 *   nothing to authenticate and `crypto.subtle.decrypt` throws `OperationError`
 *
 * Both were reaching Sentry as unhandled 500s from `POST /contact` and
 * `POST /resources/newsletter`, on input anyone can send. `checkHoneypot` has
 * to answer 400 for them without swallowing a genuine crypto failure, and
 * without touching the happy path.
 */

// `honeypot.server.ts` builds its `Honeypot` from `process.env` at import time,
// so the env has to be pinned first and the module registry cleared before the
// import — otherwise a value exported in a developer's shell changes what these
// tests assert. `TESTING` is the key that matters: setting it turns
// `validFromFieldName` off, which makes `check` return before it ever decrypts.
// Every case that depends on the decrypt would then fail loudly rather than
// pass for the wrong reason — except the happy path, which would go green
// without decrypting anything, and that is the one the "future timestamp" case
// exists to catch.
vi.stubEnv('TESTING', '')
vi.stubEnv('HONEYPOT_SECRET', 'test-honeypot-secret')

const { checkHoneypot, honeypot, isMalformedHoneypotFieldError } =
	await import('#app/utils/honeypot.server')

afterAll(() => {
	vi.restoreAllMocks()
	vi.unstubAllEnvs()
})

/**
 * A form a human submits. `name__confirm` has to be here and blank: `check`
 * only decrypts once it has passed that field, and a form carrying just
 * `from__confirm` is rejected as missing the honeypot input before the crypto
 * runs — so without this every case below would be a green 400 for the wrong
 * reason.
 */
function formDataWith(validFrom: string, name = '') {
	const formData = new FormData()
	formData.set('name__confirm', name)
	formData.set('from__confirm', validFrom)
	return formData
}

/** The 400 both a `SpamError` and a malformed field are meant to produce. */
async function captureResponse(promise: Promise<unknown>) {
	try {
		await promise
	} catch (thrown) {
		expect(thrown).toBeInstanceOf(Response)
		return thrown as Response
	}
	throw new Error('expected checkHoneypot to reject, but it resolved')
}

describe('checkHoneypot with a malformed from__confirm', () => {
	it('rejects a value that is not base64', async () => {
		const response = await captureResponse(
			checkHoneypot(formDataWith('!!!not base64!!!')),
		)
		expect(response.status).toBe(400)
	})

	it('rejects a single character, which is a base64 length that cannot exist', async () => {
		// A length of 1 (mod 4) is not decodable at all, so this stops at
		// `atob`. The shortest value that gets as far as AES-GCM is two
		// characters, covered below.
		const response = await captureResponse(checkHoneypot(formDataWith('a')))
		expect(response.status).toBe(400)
	})

	it('rejects a value that decodes to fewer bytes than the IV', async () => {
		// Two characters decode to one byte, which is less than the IV AES-GCM
		// slices off, so it never gets far enough to look at a ciphertext. This
		// is the shape a bot gets by echoing back any short base64 string.
		const response = await captureResponse(checkHoneypot(formDataWith('aa')))
		expect(response.status).toBe(400)
	})

	it('rejects a value that decodes to a whole IV but no GCM tag', async () => {
		// 12 bytes clears the IV slice and still leaves nothing to authenticate,
		// which is a different rejection inside AES-GCM from the short-IV one
		// above even though both surface as `OperationError`.
		const twelveBytes = btoa('x'.repeat(12))
		expect(atob(twelveBytes)).toHaveLength(12)
		const response = await captureResponse(
			checkHoneypot(formDataWith(twelveBytes)),
		)
		expect(response.status).toBe(400)
	})

	it('rejects a well-formed value that fails authentication', async () => {
		// Long enough to be a real token shape — a 12-byte IV plus ciphertext
		// and tag — but the tag does not verify. This is what a bot produces by
		// echoing a `from__confirm` scraped from somewhere else, and it is the
		// case that makes the narrowed check worth having.
		const forged = btoa('x'.repeat(40))
		expect(atob(forged)).toHaveLength(40)
		const response = await captureResponse(checkHoneypot(formDataWith(forged)))
		expect(response.status).toBe(400)
	})

	it('rejects a non-string value sent as a file upload', async () => {
		// A bot that names a file `from__confirm` makes `atob` stringify a
		// `File`, which is outside the base64 alphabet.
		const formData = new FormData()
		formData.set('name__confirm', '')
		formData.set(
			'from__confirm',
			new File(['junk'], 'junk.txt', { type: 'text/plain' }),
		)
		const response = await captureResponse(checkHoneypot(formData))
		expect(response.status).toBe(400)
	})
})

describe('checkHoneypot with a real submission', () => {
	it('accepts a genuine from__confirm issued by getInputProps()', async () => {
		const { encryptedValidFrom } = await honeypot.getInputProps()
		await expect(
			checkHoneypot(formDataWith(encryptedValidFrom)),
		).resolves.toBeUndefined()
	})

	it('rejects a future from__confirm with the same 400', async () => {
		// Doubles as the guard against this file going vacuous: the only thing
		// that can turn a correctly encrypted value into a 400 is the timestamp
		// check, which only runs if `check` decrypted the field.
		const { encryptedValidFrom } = await honeypot.getInputProps({
			validFromTimestamp: Date.now() + 60_000,
		})
		const response = await captureResponse(
			checkHoneypot(formDataWith(encryptedValidFrom)),
		)
		expect(response.status).toBe(400)
	})

	it('rejects a filled honeypot field as before', async () => {
		const { encryptedValidFrom } = await honeypot.getInputProps()
		const formData = new FormData()
		formData.set('name__confirm', 'I am a bot')
		formData.set('from__confirm', encryptedValidFrom)
		const response = await captureResponse(checkHoneypot(formData))
		expect(response.status).toBe(400)
	})
})

describe('checkHoneypot with the honeypot fields omitted', () => {
	// `remix-utils` has no opinion about a form carrying neither honeypot
	// field: `shouldCheckHoneypot` returns false and `check` returns without
	// throwing. That is the right call for routes with no honeypot, and the
	// wrong one here, where every form renders the fields — so a bot could skip
	// the check entirely by not sending them. These pin the requirement that
	// closes it.
	//
	// This is the bypass in its most obvious form, and it needs no crypto, no
	// forged token, and no knowledge of what the fields are called.

	it('rejects a submission carrying none of the honeypot fields', async () => {
		// A well-formed contact submission with the honeypot simply left out —
		// exactly what a bot that posts straight from a JSON payload sends.
		const formData = new FormData()
		formData.set('name', 'a')
		formData.set('email', 'a@example.com')
		formData.set('message', 'hi')

		const response = await captureResponse(checkHoneypot(formData))
		expect(response.status).toBe(400)
	})

	it('rejects a submission carrying only from__confirm', async () => {
		// One field present is enough for `shouldCheckHoneypot` to say yes, and
		// `check` then rejects it as a missing honeypot input — a 400, but by
		// the slow path through the field check rather than the requirement
		// this file is about. Pinned so the two cannot be confused.
		const { encryptedValidFrom } = await honeypot.getInputProps()
		const formData = new FormData()
		formData.set('from__confirm', encryptedValidFrom)

		const response = await captureResponse(checkHoneypot(formData))
		expect(response.status).toBe(400)
	})

	it('rejects a submission carrying only name__confirm', async () => {
		// The mirror image, and the one the requirement has to cover: with
		// `name__confirm` present and blank, `check` gets all the way to the
		// `from__confirm` lookup and throws "Missing honeypot valid from input".
		// That is a rejection too, but it is incidental — it exists only
		// because the timestamp is configured. Without this case, a
		// `from__confirm`-only bypass would look covered by the happy path.
		const formData = new FormData()
		formData.set('name__confirm', '')

		const response = await captureResponse(checkHoneypot(formData))
		expect(response.status).toBe(400)
	})

	it('answers with the same 400 as a filled honeypot', async () => {
		// Omission and filling are the same answer, so a bot cannot tell from
		// the response which mistake it made, and neither reaches Sentry.
		const { encryptedValidFrom } = await honeypot.getInputProps()
		const omitted = await captureResponse(checkHoneypot(new FormData()))
		const filled = await captureResponse(
			checkHoneypot(formDataWith(encryptedValidFrom, 'I am a bot')),
		)

		expect(omitted.status).toBe(filled.status)
		expect(await omitted.text()).toBe(await filled.text())
	})

	it('does not reject a form that has the fields, however they arrived', async () => {
		// The regression this could cause: the requirement has to key on
		// presence, not on anything about the values, or a real browser
		// submission stops working. A filled `name__confirm` is still spam and
		// a valid `from__confirm` is still fine — both are covered above and
		// in the happy-path describe; what matters here is that requiring the
		// fields did not turn into rejecting them.
		const { encryptedValidFrom } = await honeypot.getInputProps()
		await expect(
			checkHoneypot(formDataWith(encryptedValidFrom)),
		).resolves.toBeUndefined()
	})
})

describe('checkHoneypot with an error that is not spam', () => {
	it('rethrows an unrecognised DOMException instead of dressing it up as spam', async () => {
		// The narrowed check is only worth having if the default is still to
		// report, and that default lives in `checkHoneypot` rather than in the
		// predicate — so it has to be asserted here. Without this case, replacing
		// the catch with a blanket one leaves every other case in this file green.
		const cryptoFailure = new DOMException('the key is bad', 'DataError')
		vi.spyOn(honeypot, 'check').mockRejectedValueOnce(cryptoFailure)
		const { encryptedValidFrom } = await honeypot.getInputProps()

		await expect(checkHoneypot(formDataWith(encryptedValidFrom))).rejects.toBe(
			cryptoFailure,
		)
	})

	it('rethrows a non-DOMException unchanged', async () => {
		const boom = new Error('something else broke')
		vi.spyOn(honeypot, 'check').mockRejectedValueOnce(boom)
		// Both honeypot fields have to be present, or the check for missing
		// fields rejects first and the mock is never reached. This case is
		// about what happens *after* a well-formed submission is handed to
		// `check`, so the form has to be well-formed.
		const { encryptedValidFrom } = await honeypot.getInputProps()

		await expect(checkHoneypot(formDataWith(encryptedValidFrom))).rejects.toBe(
			boom,
		)
	})
})

describe('isMalformedHoneypotFieldError', () => {
	/**
	 * The property this predicate is built on, read off the errors the runtime
	 * actually throws rather than off one this test file constructed — the
	 * `new DOMException(...)` cases below cannot show that a runtime's error
	 * carries the tag, only that the constructor being used here sets it.
	 */
	it('recognises the DOMExceptions atob and crypto.subtle really throw', async () => {
		const thrown: unknown[] = []
		try {
			atob('!!!not base64!!!')
		} catch (error) {
			thrown.push(error)
		}
		const key = await crypto.subtle.importKey(
			'raw',
			new Uint8Array(32),
			{ name: 'AES-GCM' },
			false,
			['decrypt'],
		)
		try {
			await crypto.subtle.decrypt(
				{ name: 'AES-GCM', iv: new Uint8Array(12) },
				key,
				new Uint8Array(0),
			)
		} catch (error) {
			thrown.push(error)
		}

		expect(thrown).toHaveLength(2)
		for (const error of thrown) {
			expect(Object.prototype.toString.call(error)).toBe(
				'[object DOMException]',
			)
			expect(isMalformedHoneypotFieldError(error)).toBe(true)
		}
		// Both are different classes from this module's `DOMException` global,
		// which is the whole reason the predicate reads the tag rather than
		// using `instanceof`.
		for (const error of thrown) {
			expect(error).not.toBeInstanceOf(DOMException)
		}
	})

	it('recognises the two errors the honeypot field provokes', () => {
		expect(
			isMalformedHoneypotFieldError(
				new DOMException('not correctly encoded', 'InvalidCharacterError'),
			),
		).toBe(true)
		expect(
			isMalformedHoneypotFieldError(
				new DOMException('data is too small', 'OperationError'),
			),
		).toBe(true)
	})

	it('does not swallow a crypto error from another source', () => {
		// The point of narrowing on `.name`: a `DataError` or
		// `NotSupportedError` — what a bad key or algorithm raises — still has to
		// reach Sentry rather than be dressed up as spam.
		expect(
			isMalformedHoneypotFieldError(new DOMException('bad key', 'DataError')),
		).toBe(false)
		expect(
			isMalformedHoneypotFieldError(
				new DOMException('too many arguments', 'NotSupportedError'),
			),
		).toBe(false)
	})

	it('is not fooled by a non-DOMException wearing one of those names', () => {
		// `.name` alone is assignable; the class tag is what makes the check
		// mean "the runtime's DOMException" rather than "anything named that".
		const impostor = new Error('too small')
		impostor.name = 'OperationError'
		expect(isMalformedHoneypotFieldError(impostor)).toBe(false)
		expect(isMalformedHoneypotFieldError(new SpamError('filled'))).toBe(false)
		expect(isMalformedHoneypotFieldError(new Error('boom'))).toBe(false)
		expect(isMalformedHoneypotFieldError(undefined)).toBe(false)
		expect(isMalformedHoneypotFieldError({ name: 'OperationError' })).toBe(
			false,
		)
	})
})
