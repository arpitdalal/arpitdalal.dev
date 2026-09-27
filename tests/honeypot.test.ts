import { SpamError } from 'remix-utils/honeypot/server'
import { afterAll, describe, expect, it, vi } from 'vitest'

/**
 * `remix-utils` decrypts the honeypot's `from__confirm` field before it
 * validates it, with no shape check in between, so anything a bot puts there
 * throws out of `check` as a `DOMException` rather than a `SpamError`:
 *
 * - not base64 at all → `atob` throws `InvalidCharacterError`
 * - base64, but decoding to fewer than 12 bytes → AES-GCM gets an empty
 *   ciphertext and `crypto.subtle.decrypt` throws `OperationError`
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
// `validFromFieldName` off, which makes `check` return before it ever decrypts,
// and every `from__confirm` case below would pass vacuously. An empty string is
// falsy, so it pins production behaviour, and the "future timestamp" case
// further down is what holds the rest of this file honest about it.
vi.stubEnv('TESTING', '')
vi.stubEnv('HONEYPOT_SECRET', 'test-honeypot-secret')

const { checkHoneypot, honeypot, isMalformedHoneypotFieldError } =
	await import('#app/utils/honeypot.server')

afterAll(() => {
	vi.unstubAllEnvs()
})

/** A form a human submits: the honeypot is present and left blank. */
function formDataWith(validFrom: string) {
	const formData = new FormData()
	formData.set('name__confirm', '')
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

	it('rejects a value that decodes to fewer bytes than the IV', async () => {
		// `atob('a')` is an empty buffer, so `slice(12)` is an empty
		// ciphertext. This is the shape a bot gets by echoing back any short
		// base64 string, which is why it is the most common of the two.
		const response = await captureResponse(checkHoneypot(formDataWith('a')))
		expect(response.status).toBe(400)
	})

	it('rejects five bytes of well-formed base64', async () => {
		// Longer than zero, so it clears the IV slice and fails inside AES-GCM
		// instead of at `atob` — the second half of `OperationError`.
		const response = await captureResponse(
			checkHoneypot(formDataWith(btoa('12345'))),
		)
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
		// Doubles as the guard against this whole file going vacuous: the only
		// thing that can turn a correctly encrypted value into a 400 is the
		// timestamp check, which only runs if `check` decrypted the field. With
		// `validFromFieldName` off this resolves instead, and fails.
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

describe('isMalformedHoneypotFieldError', () => {
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
		// The point of narrowing on `.name`: a real `OperationError` raised
		// outside the honeypot, or another DOMException kind entirely, still
		// has to reach Sentry rather than be dressed up as spam.
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
