import { z } from 'zod'

// Zod v4 probes for `eval` support by calling the `Function` constructor
// (`zod/v4/core/util.js`), which the `script-src` policy in `server/index.ts`
// blocks because it does not allow `'unsafe-eval'`. The probe is wrapped in a
// `try`/`catch` and falls back to the interpreted parser, so nothing breaks —
// but CSP still fires a `securitypolicyviolation` for the swallowed throw, and
// `drainCspViolations` in `app/utils/monitoring.client.tsx` reports it to Sentry
// on every page load. `jitless` skips the probe outright.
//
// No parsing cost: `fastEnabled` is `jit && allowsEval.value`
// (`zod/v4/core/schemas.js`), and `allowsEval` is already `false` under this
// policy, so the JIT fastpass is already bypassed. Setting the flag only stops
// the probe from running.
z.config({ jitless: true })

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
	// `server/index.ts` reads the same variable with a deliberately lenient
	// grammar: only the exact string 'false' opts out of indexing, everything
	// else (including unset and '') means indexing is allowed. An enum would
	// reject '', '0' and 'FALSE' in `init()`, and because the app bundle is
	// imported per request inside `getBuild()` — whose catch swallows the
	// failure — a mistyped value would turn into a permanent silent 500 on
	// every route instead of a boot error. Normalise instead of rejecting, so
	// the two parsers can never disagree.
	ALLOW_INDEXING: z
		.string()
		.optional()
		.transform((value) => (value === 'false' ? 'false' : undefined)),
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
