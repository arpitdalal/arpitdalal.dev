/**
 * Session Replay bundles its own copy of rrweb, and rrweb's
 * `initStyleDeclarationObserver` reads `win.CSSStyleDeclaration.prototype` with
 * no guard. Whatever it finds there, it wraps in a `Proxy` and assigns back:
 *
 * ```js
 * const setProperty = win.CSSStyleDeclaration.prototype.setProperty;
 * win.CSSStyleDeclaration.prototype.setProperty = new Proxy(setProperty, { ... });
 * ```
 *
 * So a global that is missing, null, or a truthy stand-in all fail the same way,
 * and rrweb throws a `TypeError` out of `Sentry.init()`.
 *
 * Privacy extensions that strip CSSOM interface objects off the page's global
 * scope are what produce such a window. rrweb guards the adjacent
 * `win.CSSStyleSheet` read but not this one.
 *
 * We restore the *genuine* interface object rather than installing a stub,
 * because rrweb patches `.prototype` in place: a stand-in would leave the real
 * prototype unwrapped and silently drop every style mutation from the recording.
 *
 * A no-op in an unmodified browser. Returns false when no usable declaration can
 * be found, which leaves Replay no better off than before.
 */
export function ensureCSSStyleDeclaration(
	win: Window & typeof globalThis = window,
): boolean {
	if (canPatchStyleDeclaration(win)) return true

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
		// A non-configurable global cannot be replaced. Nothing left to try.
		return false
	}

	return canPatchStyleDeclaration(win)
}

/**
 * Whether `win` exposes a declaration rrweb can actually wrap.
 *
 * Presence is deliberately not enough. A privacy extension can leave a truthy
 * stand-in — `{}`, a string, a number — which passes a presence check and then
 * throws on the very read we are here to prevent. So we check the capability
 * rrweb depends on rather than the existence of the property.
 */
function canPatchStyleDeclaration(win: Window & typeof globalThis): boolean {
	const prototype = win.CSSStyleDeclaration?.prototype as
		Partial<CSSStyleDeclaration> | undefined

	return (
		typeof prototype?.setProperty === 'function' &&
		typeof prototype?.removeProperty === 'function'
	)
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
