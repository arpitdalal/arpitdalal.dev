import { TZDate } from '@date-fns/tz'
import { differenceInMonths, differenceInYears, addMonths } from 'date-fns'
import { useMemo } from 'react'
import { useHints } from './client-hints'

/**
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns The distance between the start and end date in the format of '1 mo' or '2 yrs 4 mos' taking user's timezone hint into account
 */
export function useFormatDistance(startDate: string, endDate: string) {
	const { timeZone } = useHints()

	return useMemo(() => {
		const start = new TZDate(startDate, timeZone)
		let end: TZDate

		if (endDate === 'Present') {
			end = TZDate.tz(timeZone)
		} else {
			end = new TZDate(endDate, timeZone)
		}
		end = addMonths(end, 1)

		const monthsDiff = differenceInMonths(end, start)
		const yearsDiff = differenceInYears(end, start)

		if (monthsDiff < 1) {
			return '1 mo'
		}

		if (yearsDiff < 1) {
			return `${monthsDiff} mo${monthsDiff > 1 ? 's' : ''}`
		}

		const remainingMonths = monthsDiff - yearsDiff * 12

		if (remainingMonths === 0) {
			return `${yearsDiff} yr${yearsDiff > 1 ? 's' : ''}`
		}

		return `${yearsDiff} yr${yearsDiff > 1 ? 's' : ''} ${remainingMonths} mo${remainingMonths > 1 ? 's' : ''}`
	}, [endDate, startDate, timeZone])
}
