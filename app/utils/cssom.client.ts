/**
 * Session Replay bundles its own copy of rrweb, and rrweb's
 * `initStyleDeclarationObserver` reads `win.CSSStyleDeclaration.prototype`
 * without a guard. That read runs synchronously inside `Sentry.init()`, so when
 * the global is missing the resulting `TypeError` escapes `init()`. Sentry does
 * not catch it: `afterSetupIntegrations` walks the integrations array in order
 * and aborts on the first throw, so Replay being first costs us browser
 * profiling and tracing as well as the replay we had already lost.
 *
 * Some privacy extensions strip CSSOM interface objects off the page's global
 * scope, which is what produces a window that still has `Object`,
 * `MutationObserver` and `HTMLInputElement` but no `CSSStyleDeclaration`. rrweb
 * guards the adjacent `CSSStyleSheet` read but not this one.
 *
 * The interface object is recoverable from any live declaration, so we restore
 * the genuine one rather than a stub. That distinction matters: rrweb wraps
 * `setProperty`/`removeProperty` in a `Proxy` and assigns the result back onto
 * `.prototype`, so pointing it at a stand-in would leave the real prototype
 * unwrapped and silently drop every style mutation from the recording.
 *
 * Returns false when the global cannot be restored, which leaves Replay broken
 * exactly as it was. This is a no-op in an unmodified browser.
 */
export function ensureCSSStyleDeclaration(
	win: Window & typeof globalThis = window,
): boolean {
	if (win.CSSStyleDeclaration) return true

	const prototype = findStyleDeclarationPrototype(win)
	const recovered = prototype?.constructor
	if (typeof recovered !== 'function') return false

	try {
		Object.defineProperty(win, 'CSSStyleDeclaration', {
			value: recovered,
			writable: true,
			enumerable: false,
			configurable: true,
		})
	} catch {
		// A non-configurable global cannot be redefined. Nothing left to try.
		return false
	}

	return win.CSSStyleDeclaration === recovered
}

/**
 * The live `CSSStyleDeclaration.prototype`, found by walking up from a
 * declaration we just created.
 *
 * The walk requires the prototype to *own* `setProperty`/`removeProperty` rather
 * than merely inherit them. A live declaration's immediate prototype is often a
 * subclass (Blink and jsdom both expose `CSSStyleProperties` at that level) that
 * inherits both from the real interface prototype one step up. Stopping there
 * would hand rrweb a subclass, and since it patches `.prototype` in place, style
 * declarations not created through that subclass would go unwrapped and their
 * mutations would silently vanish from the recording.
 */
function findStyleDeclarationPrototype(win: Window): object | null {
	let declaration: CSSStyleDeclaration
	try {
		declaration = win.document.createElement('div').style
	} catch {
		return null
	}

	let prototype: object | null = Object.getPrototypeOf(declaration)
	while (prototype) {
		if (
			Object.hasOwn(prototype, 'setProperty') &&
			Object.hasOwn(prototype, 'removeProperty')
		) {
			return prototype
		}
		prototype = Object.getPrototypeOf(prototype)
	}

	return null
}
