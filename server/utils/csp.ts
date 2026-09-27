/**
 * Build the CSP `connect-src` allowlist.
 *
 * Umami's tracker POSTs to `https://<UMAMI_DOMAIN>/api/send`. Without that
 * origin here, the beacon is blocked even after the script tag is nonced.
 * Use a full `https://` origin (not a wildcard) so a compromised Umami host
 * cannot widen the policy.
 */
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
		sentryDsn ? '*.sentry.io' : null,
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
 * Hashnode GraphQL API (`app/graphql/gql.ts`) and rendered by `CardImage` —
 * they were missing here, so every cover image was being blocked.
 */
export function cspImgSrc(): string[] {
	return ["'self'", 'data:', '*.cloudinary.com', '*.hashnode.com']
}
