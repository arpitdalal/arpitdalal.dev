import { describe, expect, it, vi } from 'vitest'

/**
 * `readFormData` is a pure function of the `Content-Type` header and the body,
 * so every shape it has to survive can be exercised here without a server.
 *
 * This is deliberately a unit test rather than more cases in
 * `tests/server.smoke.test.ts`. The two "strong" paths in `server/index.ts` —
 * `/contact` and `/resources/newsletter` — are guarded by a *single*
 * `express-rate-limit` instance keyed by IP, so every POST to either one draws
 * from the same budget of 10 per minute. An end-to-end matrix of every
 * unreadable body therefore spends rate-limit budget that the honeypot and
 * end-to-end cases need, and starts failing with a 429 that has nothing to do
 * with the code under test. The boundary cases belong here; the smoke test
 * keeps one representative per route to prove the helper is the one wired in.
 */

const { readFormData } = await import('#app/utils/form-data.server')
// Imported here rather than at the top of the file because
// `honeypot.server.ts` builds its `Honeypot` from `process.env` at import time,
// so the env has to be pinned first — the same reason `tests/honeypot.test.ts`
// does this. Only the seed matters here, and only for determinism: the token is
// minted by this same instance and verified by this same instance.
vi.stubEnv('HONEYPOT_SECRET', 'form-data-test-secret')
const { checkHoneypot, honeypot } = await import('#app/utils/honeypot.server')

/** The 400 every rejection answers with, deliberately uniform. */
const UNREADABLE_BODY = 'Form not submitted properly'

function request(contentType: string | null, body?: string): Request {
	const headers: Record<string, string> = {}
	if (contentType !== null) headers['content-type'] = contentType
	return new Request('http://localhost/contact', {
		method: 'POST',
		body,
		headers,
	})
}

async function captureStatus(promise: Promise<unknown>) {
	try {
		await promise
	} catch (thrown) {
		expect(thrown).toBeInstanceOf(Response)
		const response = thrown as Response
		expect(await response.text()).toBe(UNREADABLE_BODY)
		return response.status
	}
	throw new Error('expected readFormData to reject, but it resolved')
}

describe('readFormData with a media type it does not accept', () => {
	// The common case, and the one the original Sentry report was: scanner
	// traffic that never claimed to be a form. A body is not required to carry
	// a `Content-Type` at all, so its absence has to be handled as a refusal
	// rather than read past.
	it.each([
		['no content-type at all', null],
		['a JSON body', 'application/json'],
		['text/plain', 'text/plain'],
		['an empty content-type', ''],
		['a near miss on the spelling', 'application/x-www-form-urlencode'],
		['a type with trailing whitespace and mixed case', '  APPLICATION/JSON  '],
	])('answers 400 for %s', async (_label, contentType) => {
		expect(await captureStatus(readFormData(request(contentType, 'x')))).toBe(
			400,
		)
	})
})

describe('readFormData with a form media type it cannot parse', () => {
	// The case a media-type allowlist alone does not catch, and the reason the
	// parse is wrapped rather than the headers enumerated. `multipart/form-data`
	// carries its boundary as a header *parameter*, so a client that declares
	// the type and omits the boundary produces a body undici refuses — verified
	// against the runtime rather than assumed, since it is the whole justification
	// for catching the `TypeError` instead of listing more header shapes.
	it('answers 400 for multipart/form-data with no boundary', async () => {
		const req = request('multipart/form-data', 'not a multipart body')
		// Pin the premise: this really is unreadable, so a 400 below is the fix
		// working rather than the media-type check doing all of it.
		await expect(
			new Request('http://localhost/', {
				method: 'POST',
				body: 'not a multipart body',
				headers: { 'content-type': 'multipart/form-data' },
			}).formData(),
		).rejects.toThrow(TypeError)

		expect(await captureStatus(readFormData(req))).toBe(400)
	})

	it('answers 400 for a multipart body whose boundary is not in the body', async () => {
		// A boundary that is declared but never used to delimit anything is
		// still an unparseable body.
		expect(
			await captureStatus(
				readFormData(
					request('multipart/form-data; boundary=abc123', 'no parts here'),
				),
			),
		).toBe(400)
	})
})

describe('readFormData with a body it can read', () => {
	// The regression these guard: a guard that is too eager breaks the contact
	// form for every real user, and the only thing that catches that here is
	// these cases.
	it('reads a urlencoded body', async () => {
		const formData = await readFormData(
			request('application/x-www-form-urlencoded', 'name=Arpit&message=hi'),
		)
		expect(formData.get('name')).toBe('Arpit')
		expect(formData.get('message')).toBe('hi')
	})

	it('reads a urlencoded body that declares a charset', async () => {
		// The parameters after `;` are dropped before comparison. A browser form
		// is entitled to send a charset, and rejecting it would break the form
		// for real users — so this is a behavioural requirement, not a nicety.
		const formData = await readFormData(
			request(
				'application/x-www-form-urlencoded; charset=UTF-8',
				'name=Arpit&message=hi',
			),
		)
		expect(formData.get('name')).toBe('Arpit')
	})

	it('reads a urlencoded body regardless of the media type casing', async () => {
		const formData = await readFormData(
			request('Application/X-WWW-Form-Urlencoded', 'name=Arpit'),
		)
		expect(formData.get('name')).toBe('Arpit')
	})

	it('reads a multipart body with a boundary', async () => {
		const boundary = '----testBoundary'
		const body = [
			`--${boundary}`,
			'Content-Disposition: form-data; name="name"',
			'',
			'Arpit',
			`--${boundary}--`,
			'',
		].join('\r\n')

		const formData = await readFormData(
			request(`multipart/form-data; boundary=${boundary}`, body),
		)
		expect(formData.get('name')).toBe('Arpit')
	})
})

describe('readFormData and checkHoneypot composed', () => {
	// The two guards are the whole risk surface of these routes and both are
	// one edit away from breaking the form for every human, so they are
	// exercised here *together* on a body shaped the way a browser sends one.
	// Individually they are covered elsewhere; what this pins is that a
	// genuine submission passes both, which no single-file test can show —
	// the unit suites hand each guard a hand-built `FormData` and stop.
	//
	// No network and no rate-limit budget, unlike an end-to-end accept case:
	// a valid submission would reach `sendEmail` and open an SMTP connection
	// to a host that does not exist.
	it('accepts a browser-shaped submission through both guards', async () => {
		// Exactly what `HoneypotInputs` renders: the name field blank because
		// nobody can see it, and the timestamp token from the root loader.
		const { encryptedValidFrom, nameFieldName, validFromFieldName } =
			await honeypot.getInputProps()
		const body = new URLSearchParams({
			name: 'Arpit',
			email: 'someone@example.com',
			message: 'hello',
			[nameFieldName]: '',
			[validFromFieldName as string]: encryptedValidFrom,
		})

		const request = new Request('http://localhost/contact', {
			method: 'POST',
			body,
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
		})

		const formData = await readFormData(request)
		await expect(checkHoneypot(formData)).resolves.toBeUndefined()
	})

	it('still rejects that same submission when the honeypot fields are dropped', async () => {
		// The negative half, and the reason the positive one above is worth
		// having: it proves the accept path is the guards agreeing, not the
		// guards being absent.
		const { nameFieldName } = await honeypot.getInputProps()
		const body = new URLSearchParams({
			name: 'Arpit',
			email: 'someone@example.com',
			message: 'hello',
			[nameFieldName]: '',
		})

		const request = new Request('http://localhost/contact', {
			method: 'POST',
			body,
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
		})

		const formData = await readFormData(request)
		expect(await captureStatus(checkHoneypot(formData))).toBe(400)
	})
})

describe('readFormData and errors that are not about the body', () => {
	// The narrowing that keeps this a fix rather than a blanket catch.
	// `formData()` signals an unreadable body with a `TypeError`, so that is the
	// only thing converted; anything else is a fault on this side of the wire
	// and still belongs in Sentry. Without this case, widening the catch to
	// `catch (e) { throw new Response(...) }` silences real faults too and every
	// other test in this file stays green.
	it('rethrows a non-TypeError from the parse unchanged', async () => {
		const original = request('application/x-www-form-urlencoded', 'name=Arpit')
		// Stands in for a `File` handle that cannot be read, or any future
		// failure that is not "this body is junk".
		const boom = new Error('something on this side broke')
		vi.spyOn(original, 'formData').mockRejectedValueOnce(boom)

		await expect(readFormData(original)).rejects.toBe(boom)
	})

	it('converts a TypeError from the parse, which is the body being unreadable', async () => {
		// The other half of the narrowing, and the reason it is drawn on the
		// class rather than on a message: a `TypeError` is how `formData()`
		// reports a body it cannot parse, so it is converted whatever its text.
		const original = request('application/x-www-form-urlencoded', 'name=Arpit')
		vi.spyOn(original, 'formData').mockRejectedValueOnce(
			new TypeError('Failed to parse body as FormData.'),
		)

		expect(await captureStatus(readFormData(original))).toBe(400)
	})

	it('rethrows the body-already-used TypeError rather than answering 400', async () => {
		// The case that made the narrowing wrong. A disturbed or locked body
		// rejects with a `TypeError` too — the spec's `consume body` step 1 says
		// so, and it is what a double `formData()` produces — but it is *our*
		// bug rather than the client's, and converting it would file a server
		// fault as a rejected submission and hide it permanently.
		//
		// Reproduced for real rather than mocked, so the premise is pinned: this
		// is genuinely the error a second read produces.
		const original = request('application/x-www-form-urlencoded', 'name=Arpit')
		await original.formData()
		expect(original.bodyUsed).toBe(true)
		await expect(original.formData()).rejects.toThrow(TypeError)

		await expect(readFormData(original)).rejects.toThrow(
			/already consumed before the action read it/,
		)
	})
})
