import { describe, it, expect } from 'vitest'
import {
	getErrorMessage,
	cn,
	getDomainUrl,
	getUrl,
	tryCatch,
} from '#app/utils/misc'
import { ContactSchema, NewsletterSchema } from '#app/utils/schemas'

describe('Utility Functions', () => {
	describe('getErrorMessage', () => {
		it('should return string errors as-is', () => {
			expect(getErrorMessage('Simple error')).toBe('Simple error')
		})

		it('should extract message from Error objects', () => {
			const error = new Error('Test error message')
			expect(getErrorMessage(error)).toBe('Test error message')
		})

		it('should handle objects with message property', () => {
			const error = { message: 'Custom error message' }
			expect(getErrorMessage(error)).toBe('Custom error message')
		})

		it('should return "Unknown Error" for invalid inputs', () => {
			expect(getErrorMessage(null)).toBe('Unknown Error')
			expect(getErrorMessage(undefined)).toBe('Unknown Error')
			expect(getErrorMessage({})).toBe('Unknown Error')
		})
	})

	describe('cn (className utility)', () => {
		it('should merge class names correctly', () => {
			expect(cn('text-red-500', 'bg-blue-100')).toBe('text-red-500 bg-blue-100')
		})

		it('should handle conditional classes', () => {
			expect(cn('base-class', { 'conditional-class': true })).toBe(
				'base-class conditional-class',
			)
			expect(cn('base-class', { 'conditional-class': false })).toBe(
				'base-class',
			)
		})

		it('should handle empty inputs', () => {
			expect(cn()).toBe('')
			expect(cn('')).toBe('')
		})
	})

	describe('getDomainUrl', () => {
		it('should use X-Forwarded-Host header when available', () => {
			const request = new Request('http://example.com', {
				headers: { 'X-Forwarded-Host': 'myapp.com' },
			})
			expect(getDomainUrl(request)).toBe('https://myapp.com')
		})

		it('should use host header when X-Forwarded-Host is not available', () => {
			const request = new Request('http://example.com', {
				headers: { host: 'myapp.com' },
			})
			expect(getDomainUrl(request)).toBe('https://myapp.com')
		})

		it('should use localhost protocol for localhost', () => {
			const request = new Request('http://localhost:3000')
			expect(getDomainUrl(request)).toBe('http://localhost:3000')
		})
	})

	describe('getUrl', () => {
		it('should construct URL with origin and path', () => {
			const result = getUrl({ origin: 'https://example.com', path: '/about' })
			expect(result).toBe('https://example.com/about')
		})

		it('should remove trailing slash', () => {
			const result = getUrl({ origin: 'https://example.com', path: '/about/' })
			expect(result).toBe('https://example.com/about')
		})

		it('should use default origin when not provided', () => {
			const result = getUrl({ origin: 'https://custom.com', path: '/contact' })
			expect(result).toBe('https://custom.com/contact')
		})

		it('should use default origin when origin is undefined', () => {
			const result = getUrl({ origin: undefined as any, path: '/contact' })
			expect(result).toBe('https://arpitdalal.dev/contact')
		})
	})

	describe('tryCatch', () => {
		it('should return success result for resolved promises', async () => {
			const promise = Promise.resolve('success')
			const result = await tryCatch(promise)

			expect(result.data).toBe('success')
			expect(result.error).toBeNull()
		})

		it('should return error result for rejected promises', async () => {
			const promise = Promise.reject(new Error('test error'))
			const result = await tryCatch(promise)

			expect(result.data).toBeNull()
			expect(result.error).toBeInstanceOf(Error)
			expect(result.error?.message).toBe('test error')
		})
	})
})

describe('Form Schemas', () => {
	describe('ContactSchema', () => {
		it('should validate correct contact form data', () => {
			const validData = {
				name: 'John Doe',
				email: 'john@example.com',
				message: 'Hello, this is a test message.',
			}

			const result = ContactSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject invalid email', () => {
			const invalidData = {
				name: 'John Doe',
				email: 'invalid-email',
				message: 'Hello, this is a test message.',
			}

			const result = ContactSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject empty name', () => {
			const invalidData = {
				name: '',
				email: 'john@example.com',
				message: 'Hello, this is a test message.',
			}

			const result = ContactSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject message that is too long', () => {
			const invalidData = {
				name: 'John Doe',
				email: 'john@example.com',
				message: 'a'.repeat(1001), // Over 1000 character limit
			}

			const result = ContactSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})
	})

	describe('NewsletterSchema', () => {
		it('should validate correct email', () => {
			const validData = { email: 'user@example.com' }
			const result = NewsletterSchema.safeParse(validData)
			expect(result.success).toBe(true)
		})

		it('should reject invalid email', () => {
			const invalidData = { email: 'not-an-email' }
			const result = NewsletterSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})

		it('should reject empty email', () => {
			const invalidData = { email: '' }
			const result = NewsletterSchema.safeParse(invalidData)
			expect(result.success).toBe(false)
		})
	})
})

/**
 * The messages below are rendered directly to users by
 * app/routes/_marketing+/contact.tsx and app/components/newsletter.tsx,
 * which read `fields.<name>.errors` and `formErrors` off the submission.
 * Asserting only `.success` cannot catch a zod upgrade that changes a
 * message or an issue path, because the parse still fails either way.
 */
describe('Form Schema error messages', () => {
	const issuesOf = (
		result:
			| ReturnType<typeof ContactSchema.safeParse>
			| ReturnType<typeof NewsletterSchema.safeParse>,
	) => {
		expect(result.success).toBe(false)
		if (result.success) throw new Error('expected the parse to fail')
		return result.error.issues.map((issue) => ({
			path: issue.path,
			code: issue.code,
			message: issue.message,
		}))
	}

	const validRest = {
		name: 'John Doe',
		email: 'john@example.com',
		message: 'Hello, this is a test message.',
	}

	describe('ContactSchema', () => {
		it('reports a required name against the name field', () => {
			expect(
				issuesOf(ContactSchema.safeParse({ ...validRest, name: '' })),
			).toEqual([
				{ path: ['name'], code: 'too_small', message: 'Name is required' },
			])
		})

		it('treats a whitespace-only name as missing', () => {
			expect(
				issuesOf(ContactSchema.safeParse({ ...validRest, name: '   ' })),
			).toEqual([
				{ path: ['name'], code: 'too_small', message: 'Name is required' },
			])
		})

		it('enforces the 100 character name limit', () => {
			expect(
				issuesOf(
					ContactSchema.safeParse({ ...validRest, name: 'a'.repeat(101) }),
				),
			).toEqual([
				{
					path: ['name'],
					code: 'too_big',
					message: 'Name must be less than 100 characters',
				},
			])
		})

		it('reports a malformed email as an invalid format', () => {
			expect(
				issuesOf(
					ContactSchema.safeParse({ ...validRest, email: 'invalid-email' }),
				),
			).toEqual([
				{
					path: ['email'],
					code: 'invalid_format',
					message: 'Invalid email address',
				},
			])
		})

		it('distinguishes a missing email from a malformed one', () => {
			const { email: _omitted, ...withoutEmail } = validRest
			expect(issuesOf(ContactSchema.safeParse(withoutEmail))).toEqual([
				{ path: ['email'], code: 'invalid_type', message: 'Email is required' },
			])
		})

		it('reports a required message against the message field', () => {
			expect(
				issuesOf(ContactSchema.safeParse({ ...validRest, message: '' })),
			).toEqual([
				{
					path: ['message'],
					code: 'too_small',
					message: 'Message is required',
				},
			])
		})

		it('enforces the 1000 character message limit', () => {
			expect(
				issuesOf(
					ContactSchema.safeParse({ ...validRest, message: 'a'.repeat(1001) }),
				),
			).toEqual([
				{
					path: ['message'],
					code: 'too_big',
					message: 'Message must be less than 1000 characters',
				},
			])
		})

		it('reports every invalid field at once', () => {
			expect(
				issuesOf(
					ContactSchema.safeParse({ name: '', email: 'nope', message: '' }),
				),
			).toEqual([
				{ path: ['name'], code: 'too_small', message: 'Name is required' },
				{
					path: ['email'],
					code: 'invalid_format',
					message: 'Invalid email address',
				},
				{
					path: ['message'],
					code: 'too_small',
					message: 'Message is required',
				},
			])
		})
	})

	describe('NewsletterSchema', () => {
		it('reports a malformed email as an invalid format', () => {
			expect(
				issuesOf(NewsletterSchema.safeParse({ email: 'not-an-email' })),
			).toEqual([
				{
					path: ['email'],
					code: 'invalid_format',
					message: 'Invalid email address',
				},
			])
		})

		it('reports an empty email as an invalid format, not a missing value', () => {
			// emailField has no .min(1), so '' fails z.email() rather than a
			// length check. Pinned because the two produce different copy.
			expect(issuesOf(NewsletterSchema.safeParse({ email: '' }))).toEqual([
				{
					path: ['email'],
					code: 'invalid_format',
					message: 'Invalid email address',
				},
			])
		})

		it('reports a missing email as required', () => {
			expect(issuesOf(NewsletterSchema.safeParse({}))).toEqual([
				{ path: ['email'], code: 'invalid_type', message: 'Email is required' },
			])
		})
	})
})
