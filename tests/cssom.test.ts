import { describe, it, expect, vi } from 'vitest'
import { ensureCSSStyleDeclaration } from '#app/utils/cssom.client'

/**
 * The access pattern rrweb's `initStyleDeclarationObserver` performs, verbatim.
 * If this resolves, Session Replay gets past the read that was throwing.
 */
function rrwebStyleDeclarationRead(win: Window & typeof globalThis) {
	return win.CSSStyleDeclaration.prototype.setProperty
}

/**
 * Runs `body` against a global scope stripped of the CSSOM interface object,
 * the way a privacy extension leaves it, then puts the original back.
 */
function withCSSStyleDeclarationStripped(body: () => void): void {
	const original = Object.getOwnPropertyDescriptor(
		window,
		'CSSStyleDeclaration',
	)

	// @ts-expect-error -- deliberately reproducing a mangled global scope.
	delete window.CSSStyleDeclaration

	try {
		expect(window.CSSStyleDeclaration).toBeUndefined()
		body()
	} finally {
		if (original) {
			Object.defineProperty(window, 'CSSStyleDeclaration', original)
		}
	}
}

describe('ensureCSSStyleDeclaration', () => {
	it('leaves a healthy browser untouched', () => {
		const before = window.CSSStyleDeclaration

		expect(ensureCSSStyleDeclaration()).toBe(true)
		expect(window.CSSStyleDeclaration).toBe(before)
	})

	it('repairs a window that is missing the global', () => {
		withCSSStyleDeclarationStripped(() => {
			expect(ensureCSSStyleDeclaration()).toBe(true)
			expect(typeof rrwebStyleDeclarationRead(window)).toBe('function')
		})
	})

	it('recovers the genuine interface object, not a stub', () => {
		withCSSStyleDeclarationStripped(() => {
			const livePrototype = Object.getPrototypeOf(
				document.createElement('div').style,
			)

			ensureCSSStyleDeclaration()

			// rrweb patches `.prototype` in place, so a stand-in here would leave
			// the real prototype unwrapped and silently drop style mutations.
			expect(window.CSSStyleDeclaration.prototype).toBe(livePrototype)
		})
	})

	it('leaves the recovered prototype writable, as rrweb requires', () => {
		withCSSStyleDeclarationStripped(() => {
			ensureCSSStyleDeclaration()

			// rrweb assigns its Proxy straight onto these two.
			const proto = window.CSSStyleDeclaration.prototype as CSSStyleDeclaration
			const setProperty = vi.fn((property: string) => property)
			const removeProperty = vi.fn((property: string) => property)

			expect(() => {
				proto.setProperty = setProperty
				proto.removeProperty = removeProperty
			}).not.toThrow()
			expect(proto.setProperty).toBe(setProperty)
			expect(proto.removeProperty).toBe(removeProperty)
		})
	})

	it('is idempotent and keeps the recovered value stable', () => {
		withCSSStyleDeclarationStripped(() => {
			expect(ensureCSSStyleDeclaration()).toBe(true)
			const recovered = window.CSSStyleDeclaration
			expect(ensureCSSStyleDeclaration()).toBe(true)
			expect(window.CSSStyleDeclaration).toBe(recovered)
		})
	})

	it('reports failure instead of throwing when nothing is recoverable', () => {
		const win = {
			document: {
				createElement: () => {
					throw new Error('blocked')
				},
			},
		} as unknown as Window & typeof globalThis

		expect(ensureCSSStyleDeclaration(win)).toBe(false)
	})

	it('reports failure when the global cannot be redefined', () => {
		const win = { document } as unknown as Window & typeof globalThis
		Object.defineProperty(win, 'CSSStyleDeclaration', {
			value: undefined,
			writable: false,
			enumerable: false,
			configurable: false,
		})

		expect(ensureCSSStyleDeclaration(win)).toBe(false)
		expect(win.CSSStyleDeclaration).toBeUndefined()
	})
})
