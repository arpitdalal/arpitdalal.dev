import { describe, it, expect, vi } from 'vitest'

const { sentry } = vi.hoisted(() => ({
	sentry: {
		init: vi.fn(),
		getClient: vi.fn(),
		captureMessage: vi.fn(),
		replayIntegration: vi.fn(() => ({ name: 'Replay' })),
		browserProfilingIntegration: vi.fn(() => ({ name: 'BrowserProfiling' })),
		reactRouterBrowserTracingIntegration: vi.fn(() => ({
			name: 'BrowserTracing',
		})),
	},
}))

vi.mock('@sentry/react', () => ({
	init: (...args: unknown[]) => sentry.init(...args),
	getClient: (...args: unknown[]) => sentry.getClient(...args),
	captureMessage: (...args: unknown[]) => sentry.captureMessage(...args),
	replayIntegration: () => sentry.replayIntegration(),
	browserProfilingIntegration: () => sentry.browserProfilingIntegration(),
	reactRouterBrowserTracingIntegration: () =>
		sentry.reactRouterBrowserTracingIntegration(),
}))

const { init } = await import('#app/utils/monitoring.client')

const addIntegration = vi.fn()

/**
 * Fresh mocks and a stubbed `ENV` around each test. `vi.clearAllMocks` resets
 * calls but not implementations, so the throwing stub in the isolation test uses
 * `mockImplementationOnce` and cannot leak into the next one.
 */
function withMonitoring(body: () => void): void {
	vi.clearAllMocks()
	vi.stubGlobal('ENV', { SENTRY_DSN: 'https://abc@o0.ingest.sentry.io/0' })
	sentry.getClient.mockReturnValue({ addIntegration })

	try {
		body()
	} finally {
		vi.unstubAllGlobals()
	}
}

/** Mangles the global and blocks live-declaration lookup, so repair is impossible. */
function makeCSSOMUnrepairable(): () => void {
	const originalDescriptor = Object.getOwnPropertyDescriptor(
		window,
		'CSSStyleDeclaration',
	)
	const originalCreateElement = document.createElement.bind(document)

	Object.defineProperty(window, 'CSSStyleDeclaration', {
		value: {},
		writable: true,
		enumerable: false,
		configurable: true,
	})
	document.createElement = (() => {
		throw new Error('blocked')
	}) as typeof document.createElement

	return () => {
		document.createElement = originalCreateElement
		if (originalDescriptor) {
			Object.defineProperty(window, 'CSSStyleDeclaration', originalDescriptor)
		}
	}
}

/** The options object handed to `Sentry.init()`. */
function initOptions() {
	const [options] = sentry.init.mock.calls[0] as [
		{ integrations: { name: string }[] } & Record<string, unknown>,
	]
	return options
}

function installedIntegrationNames() {
	return initOptions().integrations.map((integration) => integration.name)
}

describe('monitoring init', () => {
	it('never hands Replay to Sentry.init, so Replay cannot break init', () => {
		withMonitoring(() => {
			init()

			// Replay must be absent from the array Sentry walks with no try/catch.
			expect(installedIntegrationNames()).not.toContain('Replay')
			expect(installedIntegrationNames()).toEqual([
				'BrowserProfiling',
				'BrowserTracing',
			])
		})
	})

	it('adds Replay separately, after the client is initialised', () => {
		withMonitoring(() => {
			init()

			expect(addIntegration).toHaveBeenCalledTimes(1)
			expect(addIntegration).toHaveBeenCalledWith({ name: 'Replay' })

			// Ordering matters: the client must exist before we add to it.
			const initOrder = sentry.init.mock.invocationCallOrder[0]!
			const addOrder = addIntegration.mock.invocationCallOrder[0]!
			expect(initOrder).toBeLessThan(addOrder)
		})
	})

	it('keeps the rest of monitoring working when Replay throws during setup', () => {
		withMonitoring(() => {
			addIntegration.mockImplementationOnce(() => {
				throw new Error('rrweb exploded')
			})

			expect(() => init()).not.toThrow()
			expect(sentry.init).toHaveBeenCalledTimes(1)
			expect(installedIntegrationNames()).toContain('BrowserTracing')
		})
	})

	it('skips Replay, but not the rest of monitoring, when CSSOM is unrepairable', () => {
		withMonitoring(() => {
			const restore = makeCSSOMUnrepairable()
			try {
				init()
			} finally {
				restore()
			}

			expect(addIntegration).not.toHaveBeenCalled()
			expect(sentry.init).toHaveBeenCalledTimes(1)
			expect(installedIntegrationNames()).toEqual([
				'BrowserProfiling',
				'BrowserTracing',
			])
		})
	})

	it('still configures replay sampling so the rates are not silently lost', () => {
		withMonitoring(() => {
			init()

			const options = initOptions()
			expect(options.replaysSessionSampleRate).toBe(0.1)
			expect(options.replaysOnErrorSampleRate).toBe(1.0)
		})
	})

	it('forwards buffered parse-time CSP violations to Sentry', () => {
		withMonitoring(() => {
			// The inline script in root.tsx fills this during parsing, which is
			// long before this module is dynamically imported.
			window.__cspViolations = [
				{
					blockedURI: 'https://stats.example.com/script.js',
					violatedDirective: 'script-src',
					effectiveDirective: 'script-src',
					disposition: 'report',
					sourceFile: 'https://arpitdalal.dev/',
					lineNumber: 1,
					columnNumber: 1,
					statusCode: 0,
				},
			]

			try {
				init()

				expect(sentry.captureMessage).toHaveBeenCalledWith(
					'CSP: script-src',
					expect.objectContaining({
						level: 'warning',
						tags: expect.objectContaining({
							csp_directive: 'script-src',
							csp_disposition: 'report',
						}),
					}),
				)
				expect(window.__cspViolations).toBeUndefined()
			} finally {
				window.__cspViolations = undefined
			}
		})
	})

	it('forwards CSP violations that fire after init', () => {
		withMonitoring(() => {
			try {
				init()
				sentry.captureMessage.mockClear()

				// jsdom has no SecurityPolicyViolationEvent constructor, so
				// build the event the browser would have produced.
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

				expect(sentry.captureMessage).toHaveBeenCalledWith(
					'CSP: img-src',
					expect.objectContaining({ level: 'warning' }),
				)
			} finally {
				window.__cspViolations = undefined
			}
		})
	})
})
