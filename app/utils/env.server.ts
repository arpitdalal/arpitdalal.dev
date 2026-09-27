import { type z } from 'zod'
import { envSchema } from './schemas'

declare global {
	namespace NodeJS {
		interface ProcessEnv extends z.infer<typeof envSchema> {}
	}
}

export function init() {
	const parsed = envSchema.safeParse(process.env)

	if (parsed.success === false) {
		console.error(
			'❌ Invalid environment variables:',
			parsed.error.flatten().fieldErrors,
		)
		console.error(
			'Missing or invalid environment variables:',
			Object.keys(parsed.error.flatten().fieldErrors),
		)
		throw new Error('Invalid environment variables')
	}
}

/**
 * This is used in both `entry.server` and `root` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getEnv() {
	return {
		MODE: process.env.NODE_ENV,
		SENTRY_DSN: process.env.SENTRY_DSN,
		POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
		UMAMI_WEBSITE_ID: process.env.UMAMI_WEBSITE_ID,
		UMAMI_DOMAIN: process.env.UMAMI_DOMAIN,
		UMAMI_DOMAINS: process.env.UMAMI_DOMAINS,
		UMAMI_SCRIPT_NAME: process.env.UMAMI_SCRIPT_NAME,
		UMAMI_PUBLIC_ANALYTICS_URL: process.env.UMAMI_PUBLIC_ANALYTICS_URL,
		// Setting this to 'false' tells the server to send an
		// `X-Robots-Tag: noindex, nofollow` response header and the document to
		// render a matching `<meta name="robots">` tag. Intended for non-production
		// deploys (staging, previews) so they do not compete with production in
		// search results. Leave it unset or 'true' in production.
		ALLOW_INDEXING: process.env.ALLOW_INDEXING,
	}
}

type ENV = ReturnType<typeof getEnv>

declare global {
	var ENV: ENV
	interface Window {
		ENV: ENV
	}
}
