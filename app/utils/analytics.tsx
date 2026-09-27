import { captureException } from '@sentry/react'
import { posthog } from 'posthog-js'
import { useState, useEffect, useRef } from 'react'
import { useRequestInfo } from './request-info'

export function usePosthogPageView() {
	const requestInfo = useRequestInfo()
	// No root loader means no request info (see `useRequestInfo`), which happens
	// for the error responses React Router short-circuits. There is no page view
	// to report in that case, and the hooks below still have to run.
	const origin = requestInfo?.origin
	const path = requestInfo?.path
	const [previousLocation, setPreviousLocation] = useState(path)
	const isInitialRender = useRef(true)

	useEffect(() => {
		if (path === undefined) return
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
