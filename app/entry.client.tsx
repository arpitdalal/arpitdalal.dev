import { captureException } from '@sentry/react'
import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

if (ENV.MODE === 'production' && ENV.SENTRY_DSN) {
	void import('./utils/monitoring.client.tsx').then(({ init }) => init())
}
if (ENV.POSTHOG_API_KEY) {
	void import('./utils/analytics.client.tsx')
		.then(({ init }) => init())
		.catch((error) => {
			captureException(error, {
				captureContext: {
					extra: { error: 'Failed to initialize analytics' },
				},
			})
			console.error('Failed to initialize analytics:', error)
		})
}

startTransition(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<HydratedRouter />
		</StrictMode>,
	)
})
