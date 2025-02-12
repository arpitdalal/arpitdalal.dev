import { posthog } from 'posthog-js'

export function init() {
	posthog.init(ENV.POSTHOG_API_KEY, {
		api_host: '/resources/ingest',
		ui_host: 'https://us.i.posthog.com',
	})
}
