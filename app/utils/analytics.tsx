import { captureException } from '@sentry/react'
import { posthog } from 'posthog-js'
import { useState, useEffect, useRef } from 'react'
import { useRequestInfo } from './request-info'

export function usePosthogPageView() {
	const { origin, path } = useRequestInfo()
	const [previousLocation, setPreviousLocation] = useState(path)
	const isInitialRender = useRef(true)

	useEffect(() => {
		try {
			if (isInitialRender.current) {
				isInitialRender.current = false
				posthog.capture('$pageview')
				return
			}

			if (path !== previousLocation) {
				posthog.capture('$pageview', {
					prevPage: `${origin}${previousLocation}`,
					currPage: `${origin}${path}`,
				})
				setPreviousLocation(path)
			}
		} catch (error) {
			captureException(error, {
				captureContext: {
					extra: { error: 'Failed to capture pageview' },
				},
			})
			console.error('Failed to capture pageview:', error)
		}
	}, [path, previousLocation, origin])

	return null
}
