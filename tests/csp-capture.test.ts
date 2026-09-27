import { describe, expect, it, vi } from 'vitest'
import {
	CSP_VIOLATION_LIMIT,
	cspCaptureScript,
	drainCspViolations,
} from '#app/utils/csp'

/** Run the inline script the way a browser would, against a fake window. */
function runCaptureScript(win: {
	addEventListener: (type: string, listener: (event: unknown) => void) => void
	__cspViolations?: unknown[]
}) {
	const fn = new Function('window', cspCaptureScript)
	fn(win)
	return win
}

function violation(overrides: Record<string, unknown> = {}) {
	return {
		blockedURI: 'https://evil.example/x.js',
		violatedDirective: 'script-src',
		effectiveDirective: 'script-src',
		disposition: 'report',
		sourceFile: 'https://arpitdalal.dev/',
		lineNumber: 1,
		columnNumber: 1,
		statusCode: 0,
		...overrides,
	}
}

describe('cspCaptureScript', () => {
	it('buffers a violation dispatched after the script runs', () => {
		const listeners: Record<string, (event: unknown) => void> = {}
		const win = runCaptureScript({
			addEventListener: (type, listener) => {
				listeners[type] = listener
			},
		})

		expect(
			listeners.securitypolicyviolation,
			'listener registered',
		).toBeTruthy()
		listeners.securitypolicyviolation?.(violation())

		expect(win.__cspViolations).toEqual([
			{
				blockedURI: 'https://evil.example/x.js',
				violatedDirective: 'script-src',
				effectiveDirective: 'script-src',
				disposition: 'report',
				sourceFile: 'https://arpitdalal.dev/',
				lineNumber: 1,
				columnNumber: 1,
				statusCode: 0,
			},
		])
	})

	it('is idempotent, so a second render cannot double-register', () => {
		const addEventListener = vi.fn()
		const win = runCaptureScript({ addEventListener })
		const first = win.__cspViolations

		runCaptureScript(win as never)

		expect(addEventListener).toHaveBeenCalledTimes(1)
		expect(win.__cspViolations).toBe(first)
	})

	it('caps the buffer so a violation loop cannot grow it without bound', () => {
		const listeners: Record<string, (event: unknown) => void> = {}
		const win = runCaptureScript({
			addEventListener: (type, listener) => {
				listeners[type] = listener
			},
		})

		for (let i = 0; i < CSP_VIOLATION_LIMIT + 10; i++) {
			listeners.securitypolicyviolation?.(violation())
		}

		expect(win.__cspViolations).toHaveLength(CSP_VIOLATION_LIMIT)
	})

	it('normalises a sparse event rather than throwing', () => {
		const listeners: Record<string, (event: unknown) => void> = {}
		const win = runCaptureScript({
			addEventListener: (type, listener) => {
				listeners[type] = listener
			},
		})

		expect(() =>
			listeners.securitypolicyviolation?.({ violatedDirective: 'img-src' }),
		).not.toThrow()
		expect(win.__cspViolations?.[0]).toMatchObject({
			violatedDirective: 'img-src',
			blockedURI: '',
			lineNumber: 0,
		})
	})
})

describe('drainCspViolations', () => {
	it('yields the buffered violations and clears the buffer', () => {
		const seen: string[] = []
		window.__cspViolations = [
			violation({ violatedDirective: 'script-src' }),
			violation({ violatedDirective: 'img-src' }),
		] as never

		const count = drainCspViolations((v) => seen.push(v.violatedDirective))

		expect(count).toBe(2)
		expect(seen).toEqual(['script-src', 'img-src'])
		expect(window.__cspViolations).toBeUndefined()
	})

	it('catches violations dispatched after the drain', () => {
		const seen: string[] = []
		drainCspViolations((v) => seen.push(v.violatedDirective))

		const event = new Event('securitypolicyviolation')
		Object.defineProperties(event, {
			blockedURI: { value: 'https://cdn.hashnode.com/x.jpeg' },
			violatedDirective: { value: 'img-src' },
			effectiveDirective: { value: 'img-src' },
			disposition: { value: 'report' },
			sourceFile: { value: '' },
			lineNumber: { value: 0 },
			columnNumber: { value: 0 },
			statusCode: { value: 0 },
		})
		window.dispatchEvent(event)

		expect(seen).toEqual(['img-src'])
	})

	it('is safe when nothing was buffered', () => {
		window.__cspViolations = undefined
		expect(() => drainCspViolations(() => {})).not.toThrow()
	})
})
