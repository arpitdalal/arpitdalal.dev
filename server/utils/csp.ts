/**
 * Build the CSP `connect-src` allowlist.
 *
 * Umami's tracker POSTs to `https://<UMAMI_DOMAIN>/api/send`, and Sentry ships
 * every envelope to the host in its DSN. Both are cross-origin, so both have to
 * be named here. Umami is a full `https://` origin rather than a wildcard so a
 * compromised Umami host cannot widen the policy.
 */

/**
 * The exact origin Sentry's envelopes go to, from `SENTRY_DSN`.
 *
 * `*.sentry.io` was the previous answer, and it is wrong for anyone pointing
 * `SENTRY_DSN` at a self-hosted or custom Sentry domain: their envelopes get
 * blocked by `connect-src`, and since `app/utils/monitoring.client.tsx` now
 * forwards CSP violations *through Sentry*, each blocked envelope triggers
 * another one. That is an unbounded loop against the Sentry quota.
 *
 * `new URL(dsn).origin` is exact — it allows the configured host and nothing
 * else, rather than every subdomain of sentry.io.
 */
export function sentryOrigin(sentryDsn: string | undefined): string | null {
	if (!sentryDsn) return null
	try {
		return new URL(sentryDsn).origin
	} catch {
		// A malformed DSN cannot be reached anyway; Sentry itself will refuse
		// it. Omitting the host keeps the policy tight instead of guessing.
		return null
	}
}

export function cspConnectSrc({
	mode,
	sentryDsn,
	umamiDomain,
}: {
	mode: string
	sentryDsn: string | undefined
	umamiDomain: string | undefined
}): string[] {
	return [
		mode === 'development' ? 'ws:' : null,
		sentryOrigin(sentryDsn),
		umamiDomain ? `https://${umamiDomain}` : null,
		"'self'",
	].filter((value): value is string => value != null)
}

/**
 * Build the CSP `img-src` allowlist.
 *
 * `*.cloudinary.com` backs the logo in `app/components/logo.tsx` and the
 * project screenshots in `app/routes/_marketing+/__data.ts`.
 * `*.hashnode.com` backs the blog/notes `coverImage.url` values served by the
 * Hashnode GraphQL API (`app/graphql/gql.ts`) and rendered by `CardImage`.
 */
export function cspImgSrc(): string[] {
	return ["'self'", 'data:', '*.cloudinary.com', '*.hashnode.com']
}
