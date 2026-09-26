// The `/vitest` entry registers the matchers on Vitest's `expect` and
// carries the type augmentation for them. The bare `@testing-library/jest-dom`
// entry only patches Jest's global, so importing that one leaves
// `toBeInTheDocument` and `toHaveAttribute` untyped under `tsc`.
import '@testing-library/jest-dom/vitest'
