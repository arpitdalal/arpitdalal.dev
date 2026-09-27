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
 * Runs `body` against a global scope whose `CSSStyleDeclaration` has been
 * replaced with `value`, the way a privacy extension leaves it, then puts the
 * original back.
 */
function withCSSStyleDeclarationReplacedBy(
	value: unknown,
	body: () => void,
): void {
	const original = Object.getOwnPropertyDescriptor(
		window,
		'CSSStyleDeclaration',
	)

	Object.defineProperty(window, 'CSSStyleDeclaration', {
		value,
		writable: true,
		enumerable: false,
		configurable: true,
	})

	try {
		body()
	} finally {
		if (original) {
			Object.defineProperty(window, 'CSSStyleDeclaration', original)
		}
	}
}

/** Replaces the global with `undefined`, i.e. it is simply not there. */
function withCSSStyleDeclarationMissing(body: () => void): void {
	withCSSStyleDeclarationReplacedBy(undefined, body)
}

describe('ensureCSSStyleDeclaration', () => {
	it('leaves a healthy browser untouched', () => {
		const before = window.CSSStyleDeclaration

		expect(ensureCSSStyleDeclaration()).toBe(true)
		expect(window.CSSStyleDeclaration).toBe(before)
	})

	it('repairs a window that is missing the global', () => {
		withCSSStyleDeclarationMissing(() => {
			expect(ensureCSSStyleDeclaration()).toBe(true)
			expect(typeof rrwebStyleDeclarationRead(window)).toBe('function')
		})
	})

	// A truthy stand-in is the same failure as an absent global: rrweb reads
	// `.prototype` off whatever is there. A presence check would wave all of
	// these straight through, which is the bug this replaced.
	it.each([
		['an empty object', {}],
		['a string', 'CSSStyleDeclaration'],
		['a number', 42],
		['an array', []],
		['a null-prototype object', Object.create(null)],
		['an object with an empty prototype', { prototype: {} }],
		['a function', function fake() {}],
	])('repairs a truthy stand-in: %s', (_label, value) => {
		withCSSStyleDeclarationReplacedBy(value, () => {
			expect(Boolean(window.CSSStyleDeclaration)).toBe(true)
			expect(ensureCSSStyleDeclaration()).toBe(true)
			expect(typeof rrwebStyleDeclarationRead(window)).toBe('function')
		})
	})

	it('recovers the genuine interface object, not a stub', () => {
		withCSSStyleDeclarationMissing(() => {
			ensureCSSStyleDeclaration()

			const recovered = window.CSSStyleDeclaration.prototype
			expect(recovered.constructor?.name).toBe('CSSStyleDeclaration')
			// rrweb patches `.prototype` in place, so a stand-in here would leave
			// the real prototype unwrapped and silently drop style mutations.
			expect(typeof recovered.setProperty).toBe('function')
			expect(typeof recovered.removeProperty).toBe('function')
		})
	})

	it('walks past an inheriting subclass to the prototype that owns the methods', () => {
		// Blink and jsdom both put `CSSStyleProperties` at the immediate prototype
		// of a live declaration, and it inherits both methods rather than owning
		// them. Stopping there would hand rrweb a subclass.
		const immediate = Object.getPrototypeOf(document.createElement('div').style)
		expect(Object.hasOwn(immediate, 'setProperty')).toBe(false)

		withCSSStyleDeclarationMissing(() => {
			ensureCSSStyleDeclaration()

			const recovered = window.CSSStyleDeclaration.prototype
			expect(recovered).not.toBe(immediate)
			expect(Object.hasOwn(recovered, 'setProperty')).toBe(true)
			expect(Object.hasOwn(recovered, 'removeProperty')).toBe(true)
		})
	})

	it('leaves the recovered prototype writable, as rrweb requires', () => {
		withCSSStyleDeclarationMissing(() => {
			ensureCSSStyleDeclaration()

			// rrweb assigns its Proxy straight onto these two. The recovered object is
			// the live prototype, so put the originals back afterwards.
			const proto = window.CSSStyleDeclaration.prototype as CSSStyleDeclaration
			const originalSet = Object.getOwnPropertyDescriptor(proto, 'setProperty')
			const originalRemove = Object.getOwnPropertyDescriptor(
				proto,
				'removeProperty',
			)
			const setProperty = vi.fn((property: string) => property)
			const removeProperty = vi.fn((property: string) => property)

			try {
				proto.setProperty = setProperty
				proto.removeProperty = removeProperty
				expect(proto.setProperty).toBe(setProperty)
				expect(proto.removeProperty).toBe(removeProperty)
			} finally {
				if (originalSet) {
					Object.defineProperty(proto, 'setProperty', originalSet)
				}
				if (originalRemove) {
					Object.defineProperty(proto, 'removeProperty', originalRemove)
				}
			}
		})
	})

	it('is idempotent and keeps the recovered value stable', () => {
		withCSSStyleDeclarationMissing(() => {
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
