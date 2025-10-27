import { z } from 'zod'

// Common field schemas
export const emailField = z
	.string({ error: 'Email is required' })
	.check(z.email({ error: 'Invalid email address' }))
	.describe('A valid email address')

export const nameField = z
	.string({ error: 'Name is required' })
	.trim()
	.min(1, { error: 'Name is required' })
	.max(100, { error: 'Name must be less than 100 characters' })
	.describe('Your full name')

export const messageField = z
	.string({ error: 'Message is required' })
	.trim()
	.min(1, { error: 'Message is required' })
	.max(1000, { error: 'Message must be less than 1000 characters' })
	.describe('Your message')

// Form schemas
export const ContactSchema = z.object({
	name: nameField,
	email: emailField,
	message: messageField,
})

export const NewsletterSchema = z.object({
	email: emailField,
})

// API response schemas
export const SubscribeResponseSchema = z.object({
	data: z
		.object({
			subscribeToNewsletter: z.object({
				status: z.string(),
			}),
		})
		.optional(),
	errors: z
		.array(
			z.object({
				message: z.string(),
			}),
		)
		.optional(),
})

// Environment variables schema
export const envSchema = z.object({
	NODE_ENV: z.enum(['production', 'development', 'test'] as const),
	SESSION_SECRET: z.string(),
	INTERNAL_COMMAND_TOKEN: z.string(),
	HONEYPOT_SECRET: z.string(),
	SENTRY_DSN: z.string(),
	NODEMAILER_HOST: z.string(),
	NODEMAILER_USER: z.string(),
	NODEMAILER_PASSWORD: z.string(),
	HASHNODE_PUBLICATION_ID: z.string(),
	POSTHOG_API_KEY: z.string(),
	UMAMI_WEBSITE_ID: z.string(),
	UMAMI_DOMAIN: z.string(),
	UMAMI_DOMAINS: z.string(),
	UMAMI_SCRIPT_NAME: z.string(),
	UMAMI_PUBLIC_ANALYTICS_URL: z.string().optional(),
})

// Type exports for TypeScript inference
export type ContactFormData = z.infer<typeof ContactSchema>
export type NewsletterFormData = z.infer<typeof NewsletterSchema>
export type SubscribeResponse = z.infer<typeof SubscribeResponseSchema>
export type Env = z.infer<typeof envSchema>

// Utility function to generate JSON Schema (useful for API documentation)
export function generateJSONSchema<T extends z.ZodTypeAny>(schema: T) {
	return z.toJSONSchema(schema)
}
