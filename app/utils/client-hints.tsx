/**
 * This file contains utilities for using client hints for user preference which
 * are needed by the server, but are only known by the browser.
 */
import { getHintUtils } from '@epic-web/client-hints'
import {
	clientHint as colorSchemeHint,
	subscribeToSchemeChange,
} from '@epic-web/client-hints/color-scheme'
import { clientHint as reducedMotionHint } from '@epic-web/client-hints/reduced-motion'
import * as React from 'react'
import { useRevalidator } from 'react-router'
import { useRequestInfo } from './request-info'

const timeZoneHint = {
	cookieName: 'CH-time-zone',
	getValueCode: 'Intl.DateTimeFormat().resolvedOptions().timeZone',
	fallback: 'America/Toronto',
} as const

const hintsUtils = getHintUtils({
	theme: colorSchemeHint,
	timeZone: timeZoneHint,
	reducedMotion: reducedMotionHint,
	// add other hints here
})

export const { getHints } = hintsUtils

function getPreferredLocale(request: Request): string {
	const header = request.headers.get('accept-language')
	if (!header) return 'en'
	return header.split(',')[0]?.split(';')[0]?.trim() || 'en'
}

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

/**
 * Formats a date string for display.
 *
 * **`YYYY-MM-DD` (date-only):** treated as a civil calendar day, not a clock
 * instant in the viewer's zone. Parsed as UTC midnight and formatted with
 * `timeZone: 'UTC'` so the day does not shift (e.g. the 18th stays the 18th).
 * Locale still comes from `Accept-Language` for month/day wording.
 *
 * **Full ISO datetimes:** formatted in the viewer's time zone from client hints
 * (see {@link getHints}).
 */
export function formatDateWithHints(isoDate: string, request: Request) {
	const locale = getPreferredLocale(request)
	const trimmed = isoDate.trim()
	if (ISO_DATE_ONLY.test(trimmed)) {
		const parts = trimmed.split('-')
		const y = Number(parts[0])
		const mo = Number(parts[1])
		const day = Number(parts[2])
		const utcMidnight = new Date(Date.UTC(y, mo - 1, day))
		return new Intl.DateTimeFormat(locale, {
			dateStyle: 'long',
			timeZone: 'UTC',
		}).format(utcMidnight)
	}
	const hints = getHints(request)
	return new Intl.DateTimeFormat(locale, {
		dateStyle: 'long',
		timeZone: hints.timeZone,
	}).format(new Date(isoDate))
}

/**
 * @returns an object with the client hints and their values
 */
export function useHints() {
	const requestInfo = useRequestInfo()
	return requestInfo.hints
}

/**
 * @returns inline script element that checks for client hints and sets cookies
 * if they are not set then reloads the page if any cookie was set to an
 * inaccurate value.
 */
export function ClientHintCheck({ nonce }: { nonce: string }) {
	const { revalidate } = useRevalidator()
	React.useEffect(
		() => subscribeToSchemeChange(() => revalidate()),
		[revalidate],
	)

	return (
		<script
			nonce={nonce}
			dangerouslySetInnerHTML={{
				__html: hintsUtils.getClientHintCheckScript(),
			}}
		/>
	)
}
