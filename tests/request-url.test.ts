import { describe, expect, it } from 'vitest'
import { decodeRequestUrl } from '../server/utils/request-url'

describe('decodeRequestUrl', () => {
	it('decodes a well-formed URL', () => {
		expect(decodeRequestUrl('/talks?q=a%20b')).toBe('/talks?q=a b')
	})

	it('falls back to the raw URL when decoding throws', () => {
		// morgan evaluates its tokens from the response's `finished` event, so a
		// throw here escapes as an uncaught exception and takes the process down
		// rather than failing a single log line.
		expect(decodeRequestUrl('/%')).toBe('/%')
		expect(decodeRequestUrl('/%zz')).toBe('/%zz')
		expect(decodeRequestUrl('/%e0%a4%a')).toBe('/%e0%a4%a')
	})

	it('treats a missing URL as empty rather than throwing', () => {
		expect(decodeRequestUrl(undefined)).toBe('')
	})
})
