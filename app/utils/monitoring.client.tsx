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
	// rrweb reads `CSSStyleDeclaration.prototype` unguarded while setting up
	// Replay, and that happens inside `Sentry.init()`. Repair the global first so
	// the read cannot throw, and skip Replay outright if it cannot be repaired —
	// registering it anyway would throw out of init() and surface as a misleading
	// "failed to initialize error monitoring" even though errors and tracing are
	// fine by then.
	const canReplay = ensureCSSStyleDeclaration()
	if (!canReplay) {
		console.warn(
			'Sentry Replay disabled: CSSStyleDeclaration is unavailable and could not be restored.',
		)
	}

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
		// Replay goes last on purpose. It is the optional integration, rrweb does a
		// lot of unguarded global reads while setting up, and Sentry runs
		// `afterAllSetup` in array order and aborts on the first throw — so an
		// earlier Replay would cost us profiling and tracing too, not just replay.
		integrations: [
			Sentry.browserProfilingIntegration(),
			Sentry.reactRouterBrowserTracingIntegration({
				useEffect: React.useEffect,
				useLocation,
				useNavigationType,
				createRoutesFromChildren,
				matchRoutes,
			}),
			...(canReplay ? [Sentry.replayIntegration()] : []),
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
}
