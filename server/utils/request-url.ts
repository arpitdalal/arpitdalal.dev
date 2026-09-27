/**
 * Decodes a request URL for logging.
 *
 * morgan evaluates its format tokens from the response's `finished` event, so a
 * token that throws does not fail a log line — it escapes as an uncaught
 * exception and takes the process down mid-request. `decodeURIComponent` throws
 * a `URIError` on a malformed percent-encoding, and scanners send paths like
 * `/%` constantly, so fall back to the raw URL.
 */
export function decodeRequestUrl(url: string | undefined): string {
	try {
		return decodeURIComponent(url ?? '')
	} catch {
		return url ?? ''
	}
}
