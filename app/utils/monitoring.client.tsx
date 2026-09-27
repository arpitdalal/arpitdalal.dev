import * as Sentry from '@sentry/react'
import React from 'react'
import {
	createRoutesFromChildren,
	matchRoutes,
	useLocation,
	useNavigationType,
} from 'react-router'
import { ensureCSSStyleDeclaration } from './cssom.client'

export function init() {
	Sentry.init({
		dsn: ENV.SENTRY_DSN,
		environment: ENV.MODE,
		beforeSend(event) {
			if (event.request?.url) {
				const url = new URL(event.request.url)
				if (
					url.protocol === 'chrome-extension:' ||
					url.protocol === 'moz-extension:'
				) {
					// This error is from a browser extension, ignore it
					return null
				}
			}
			return event
		},
		integrations: [
			Sentry.browserProfilingIntegration(),
			Sentry.reactRouterBrowserTracingIntegration({
				useEffect: React.useEffect,
				useLocation,
				useNavigationType,
				createRoutesFromChildren,
				matchRoutes,
			}),
		],

		// Set tracesSampleRate to 1.0 to capture 100%
		// of transactions for performance monitoring.
		// We recommend adjusting this value in production
		tracesSampleRate: 1.0,

		// Capture Replay for 10% of all sessions,
		// plus for 100% of sessions with an error
		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1.0,
	})

	// reportOnly CSP violations never hit a report-uri here, so without this
	// listener they only exist in the browser console — which is how Umami's
	// missing nonce stayed invisible. Forward them so the next CSP hole is
	// visible in Sentry before reportOnly is flipped off.
	window.addEventListener('securitypolicyviolation', (event) => {
		Sentry.captureMessage(`CSP: ${event.violatedDirective}`, {
			level: 'warning',
			tags: {
				csp_directive: event.effectiveDirective,
				csp_disposition: event.disposition,
			},
			extra: {
				blockedURI: event.blockedURI,
				violatedDirective: event.violatedDirective,
				effectiveDirective: event.effectiveDirective,
				originalPolicy: event.originalPolicy,
				disposition: event.disposition,
				sourceFile: event.sourceFile,
				lineNumber: event.lineNumber,
			},
		})
	})

	startReplay()
}

/**
 * Start Session Replay, isolated from everything else.
 *
 * rrweb performs a long run of unguarded global reads while it starts up, and
 * Sentry invokes integration `afterAllSetup` hooks with no `try`/`catch` around
 * them. Registering Replay up front therefore meant any one of those reads could
 * throw out of `Sentry.init()` and take error reporting, profiling and tracing
 * down with it — that is exactly how a missing `CSSStyleDeclaration` cost us all
 * three. Adding it here, in its own step, means a Replay failure can now only
 * ever cost us the replay.
 *
 * The sample rates above still apply: Replay reads them off the client during
 * setup, which is more complete now that the client is fully initialised. Sentry
 * sessions are unaffected too, since `BrowserSession` (a default integration)
 * owns session creation rather than Replay.
 */
function startReplay() {
	if (!ensureCSSStyleDeclaration()) {
		console.warn(
			'Sentry Replay disabled: no usable CSSStyleDeclaration on this window, and one could not be restored.',
		)
		return
	}

	try {
		Sentry.getClient()?.addIntegration(Sentry.replayIntegration())
	} catch (error) {
		console.warn('Sentry Replay failed to start:', error)
	}
}
