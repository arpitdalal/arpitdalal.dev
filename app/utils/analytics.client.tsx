import { captureMessage } from '@sentry/react'
import { posthog } from 'posthog-js'

export function init() {
	posthog.init(ENV.POSTHOG_API_KEY, {
		api_host: '/resources/ingest',
		ui_host: 'https://us.posthog.com',
		// PostHog resolves autocapture, session recording and feature flags
		// from the remote-config response at /flags, and leaves autocapture
		// switched off when that request fails. The site keeps working and
		// simply stops sending events, so surface it instead of only logging.
		//
		// The SDK's RequestResponse type exposes statusCode/text/error but not
		// the endpoint, so a /flags failure cannot be told apart from a failed
		// event post here. The server-side proxy does see the path and
		// distinguishes them; see app/routes/resources+/ingest.$.tsx.
		on_request_error: ({ error, statusCode }) => {
			captureMessage('PostHog request failed', {
				level: 'warning',
				tags: { posthog_status: String(statusCode) },
				extra: { error: String(error), statusCode },
			})
		},
	})
}
