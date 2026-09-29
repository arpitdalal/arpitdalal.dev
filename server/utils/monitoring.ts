import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

export function init() {
	Sentry.init({
		dsn: process.env.SENTRY_DSN,
		environment: process.env.NODE_ENV,
		// Set explicitly rather than left to the bundler plugin's injected global.
		// That injection only reaches the client bundle — there is no global scope
		// in Node for the plugin to write to, and @sentry/node has no
		// SENTRY_RELEASE env fallback of its own (grep the package: no hits). So
		// without this line the server sends events with no release at all, and
		// since ~99% of this project's error volume is server-side, that is
		// nearly all of it. See #15.
		//
		// COMMIT_SHA is declared as an ARG/ENV in *both* stages of other/Dockerfile;
		// ARG does not cross a FROM, so the build-stage declaration alone leaves
		// this undefined at runtime.
		release: process.env.COMMIT_SHA,
		tracesSampleRate: process.env.NODE_ENV === 'production' ? 1 : 0,
		denyUrls: [
			/\/resources\/healthcheck/,
			// TODO: be smarter about the public assets...
			/\/build\//,
			/\/favicons\//,
			/\/img\//,
			/\/fonts\//,
			/\/favicon.ico/,
			/\/site\.webmanifest/,
		],
		integrations: [Sentry.httpIntegration(), nodeProfilingIntegration()],
		tracesSampler(samplingContext) {
			const request = samplingContext.normalizedRequest

			// ignore healthcheck transactions by other services (consul, etc.)
			if (request?.url?.includes('/resources/healthcheck')) {
				return 0
			}

			// The healthcheck route in app/routes/resources+/healthcheck.tsx
			// requests `/` with this header set, so the URL check above cannot
			// catch it.  Note that the header name is case-sensitive here.
			//
			// This used to be a beforeSendTransaction returning null. Sentry 11
			// defaults to traceLifecycle: 'stream', which ignores that callback
			// outright, and it is removed in v12. beforeSendSpan is the
			// documented replacement but is typed `(span) => span`, so it can
			// only rewrite a span, not drop one. Returning 0 from tracesSampler
			// drops the root span, so the transaction is never created at all
			// rather than being built and then discarded.
			if (request?.headers?.['x-healthcheck'] === 'true') {
				return 0
			}

			return 1
		},
	})
}
