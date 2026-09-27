/**
 * CSP violation capture.
 *
 * The policy in `server/index.ts` is `reportOnly`, so violations are never
 * enforced — but the directives object also has no `report-uri` or `report-to`,
 * which means the browser had nowhere to send them. They existed only as
 * devtools console lines, which is how a policy that was wrong in two places
 * stayed invisible.
 *
 * Registering the listener from `monitoring.client.tsx` is too late. That
 * module is dynamically imported from `entry.client.tsx`, so it runs after the
 * document has been parsed — and the violations most worth seeing (the Umami
 * tracker, SSR images) are dispatched *during* parsing. Those events fire
 * before any listener exists and are lost permanently.
 *
 * So the listener is installed by an inline nonced script at the top of
 * `<head>` instead, which pushes into a bounded buffer. `drainCspViolations`
 * is called once Sentry exists, forwarding both the buffered parse-time
 * violations and anything that fires afterwards.
 */

/** Cap the buffer so a page in a violation loop cannot grow it without bound. */
export const CSP_VIOLATION_LIMIT = 20

export type CspViolation = {
	blockedURI: string
	violatedDirective: string
	effectiveDirective: string
	disposition: string
	sourceFile: string
	lineNumber: number
	columnNumber: number
	statusCode: number
}

/**
 * Inline script source, rendered as the first child of `<head>`.
 *
 * Deliberately dependency-free and defensive: this runs before hydration, and
 * a throw here would take down the whole document rather than just reporting.
 */
export const cspCaptureScript = `(function(){
if (window.__cspViolations) return;
var seen = [];
window.__cspViolations = seen;
window.addEventListener('securitypolicyviolation', function (event) {
if (seen.length >= ${CSP_VIOLATION_LIMIT}) return;
seen.push({
blockedURI: String(event.blockedURI || ''),
violatedDirective: String(event.violatedDirective || ''),
effectiveDirective: String(event.effectiveDirective || ''),
disposition: String(event.disposition || ''),
sourceFile: String(event.sourceFile || ''),
lineNumber: Number(event.lineNumber || 0),
columnNumber: Number(event.columnNumber || 0),
statusCode: Number(event.statusCode || 0)
});
});
})();`

/**
 * Whether a violation was caused by Sentry's own transport being refused.
 *
 * Reporting a violation means sending an envelope to Sentry. If that envelope
 * is itself blocked, forwarding the violation produces another blocked
 * envelope, which produces another violation — an unbounded loop against the
 * Sentry quota, triggered by nothing but a page load.
 *
 * `connect-src` is built from the DSN origin precisely so this cannot happen
 * (`sentryOrigin` in `server/utils/csp.ts`). This is the second lock on the
 * same door, for the case where the policy is tightened later and someone
 * removes the Sentry host without realising what the violation handler does.
 */
export function isSentryViolation(
	blockedURI: string,
	sentryDsn: string | undefined,
): boolean {
	if (!sentryDsn || !blockedURI) return false
	try {
		return new URL(blockedURI).origin === new URL(sentryDsn).origin
	} catch {
		return false
	}
}

declare global {
	interface Window {
		__cspViolations?: CspViolation[]
	}
}

/**
 * Hand the buffered violations to the caller and install a live listener for
 * everything after this point, so violations are not double-reported.
 */
export function drainCspViolations(
	onViolation: (violation: CspViolation) => void,
): number {
	const buffered = window.__cspViolations ?? []
	window.__cspViolations = undefined

	for (const violation of buffered.slice(0, CSP_VIOLATION_LIMIT)) {
		onViolation(violation)
	}

	window.addEventListener('securitypolicyviolation', (event) => {
		onViolation({
			blockedURI: String(event.blockedURI || ''),
			violatedDirective: String(event.violatedDirective || ''),
			effectiveDirective: String(event.effectiveDirective || ''),
			disposition: String(event.disposition || ''),
			sourceFile: String(event.sourceFile || ''),
			lineNumber: Number(event.lineNumber || 0),
			columnNumber: Number(event.columnNumber || 0),
			statusCode: Number(event.statusCode || 0),
		})
	})

	return buffered.length
}
