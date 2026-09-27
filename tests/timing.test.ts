import { describe, expect, it } from 'vitest'
import {
	combineServerTimings,
	getServerTimeHeader,
	makeTimings,
	time,
} from '#app/utils/timing.server'

describe('getServerTimeHeader', () => {
	it('returns an empty string with no timings', () => {
		expect(getServerTimeHeader()).toBe('')
	})

	it('sanitises characters that are not allowed in a metric name', () => {
		// The Server-Timing grammar does not allow `:`, `/`, `,` and friends in
		// a metric name, so they are replaced with underscores.
		const header = getServerTimeHeader({
			'cache:get/user,1': [{ time: 1 }],
		})
		expect(header).toBe('cache_get_user_1;dur=1.0')
	})
})

describe('makeTimings', () => {
	it('serialises the open timer to a duration measured from creation', () => {
		const timings = makeTimings('root loader', 'root loader')
		const header = timings.toString()

		expect(header).toMatch(/^root_loader;desc="root loader";dur=\d+\.\d$/)
	})

	it('does not expose toString as an enumerable key', () => {
		// The timings object is spread into nothing, but if it were ever logged
		// or serialised an enumerable toString would show up as noise.
		const timings = makeTimings('root loader')
		expect(Object.keys(timings)).toEqual(['root loader'])
	})
})

describe('time', () => {
	it('records a duration for the timed work', async () => {
		const timings = makeTimings('root loader')

		const result = await time(async () => 'value', {
			timings,
			type: 'work',
			desc: 'the work',
		})

		expect(result).toBe('value')
		expect(getServerTimeHeader(timings)).toContain('work;desc="the work";dur=')
	})

	it('accepts an already-started promise', async () => {
		const timings = makeTimings('root loader')
		await expect(
			time(Promise.resolve(1), { timings, type: 'work' }),
		).resolves.toBe(1)
		expect(getServerTimeHeader(timings)).toContain('work;dur=')
	})

	it('resolves without timings and does not throw', async () => {
		await expect(time(async () => 2, { type: 'work' })).resolves.toBe(2)
	})

	it('still records a duration when the timed work rejects', async () => {
		// A failing loader is exactly when a timing is most worth having, so it
		// must not be the one case that drops the metric.
		const timings = makeTimings('root loader')

		await expect(
			time(
				async () => {
					throw new Error('boom')
				},
				{ timings, type: 'work', desc: 'the work' },
			),
		).rejects.toThrow('boom')

		expect(getServerTimeHeader(timings)).toContain('work;desc="the work";dur=')
	})

	it('records a duration when the work throws synchronously', async () => {
		const timings = makeTimings('root loader')

		await expect(
			time(
				() => {
					throw new Error('boom')
				},
				{ timings, type: 'work' },
			),
		).rejects.toThrow('boom')

		expect(getServerTimeHeader(timings)).toContain('work;dur=')
	})
})

describe('combineServerTimings', () => {
	// `Headers.append` joins repeated values with ", " per the Fetch spec.
	it('appends the second header to the first', () => {
		const headers1 = new Headers({ 'Server-Timing': 'a;dur=1' })
		const headers2 = new Headers({ 'Server-Timing': 'b;dur=2' })

		expect(combineServerTimings(headers1, headers2)).toBe('a;dur=1, b;dur=2')
	})

	it('appends an empty entry when the second header is absent', () => {
		const headers1 = new Headers({ 'Server-Timing': 'a;dur=1' })
		expect(combineServerTimings(headers1, new Headers())).toBe('a;dur=1, ')
	})
})
