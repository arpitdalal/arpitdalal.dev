import { describe, expect, it } from 'vitest'
import { cspConnectSrc, cspImgSrc } from '../server/utils/csp'

describe('cspConnectSrc', () => {
	it('includes the Umami origin when UMAMI_DOMAIN is set', () => {
		expect(
			cspConnectSrc({
				mode: 'production',
				sentryDsn: undefined,
				umamiDomain: 'stats.example.com',
			}),
		).toEqual(['https://stats.example.com', "'self'"])
	})

	it('omits Umami when UMAMI_DOMAIN is unset', () => {
		expect(
			cspConnectSrc({
				mode: 'production',
				sentryDsn: undefined,
				umamiDomain: undefined,
			}),
		).toEqual(["'self'"])
	})

	it('keeps sentry and ws allowances beside Umami', () => {
		expect(
			cspConnectSrc({
				mode: 'development',
				sentryDsn: 'https://example@sentry.io/1',
				umamiDomain: 'stats.example.com',
			}),
		).toEqual(['ws:', '*.sentry.io', 'https://stats.example.com', "'self'"])
	})
})

describe('cspImgSrc', () => {
	it('allows the Hashnode CDN that serves blog and notes cover images', () => {
		// These come from `coverImage.url` in the Hashnode GraphQL response, so
		// without `*.hashnode.com` every cover image was blocked.
		expect(cspImgSrc()).toContain('*.hashnode.com')
	})

	it('keeps self, data, and the Cloudinary host used by the logo', () => {
		expect(cspImgSrc()).toEqual([
			"'self'",
			'data:',
			'*.cloudinary.com',
			'*.hashnode.com',
		])
	})
})
