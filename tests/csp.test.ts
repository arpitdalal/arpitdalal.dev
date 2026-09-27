import { describe, expect, it } from 'vitest'
import { cspConnectSrc, cspImgSrc, sentryOrigin } from '../server/utils/csp'

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
		).toEqual([
			'ws:',
			'https://sentry.io',
			'https://stats.example.com',
			"'self'",
		])
	})
})

describe('sentryOrigin', () => {
	it('allows the exact host from the DSN, not every sentry.io subdomain', () => {
		// A self-hosted Sentry is the case that matters: with `*.sentry.io` its
		// envelopes were blocked by connect-src, and since violations are
		// reported *through Sentry* that recursed on every page load.
		expect(
			cspConnectSrc({
				mode: 'production',
				sentryDsn: 'https://abc123@o0.ingest.sentry.io/456',
				umamiDomain: undefined,
			}),
		).toEqual(['https://o0.ingest.sentry.io', "'self'"])
	})

	it('supports a self-hosted Sentry on a custom domain', () => {
		expect(sentryOrigin('https://key@sentry.internal.example:9000/1')).toBe(
			'https://sentry.internal.example:9000',
		)
	})

	it('omits the host when no DSN is configured', () => {
		expect(sentryOrigin(undefined)).toBeNull()
		expect(sentryOrigin('')).toBeNull()
	})

	it('omits the host for a malformed DSN rather than guessing', () => {
		expect(sentryOrigin('not-a-url')).toBeNull()
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
