import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import getPort, { portNumbers } from 'get-port'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * `ALLOW_INDEXING` is read in two places that sit on either side of the
 * app/server boundary: `server/index.ts` sets the `X-Robots-Tag` response
 * header, and `app/root.tsx` renders a `<meta name="robots">` tag from the same
 * value via `getEnv()`. Nothing in the type system links the two, so removing
 * the key from `getEnv()` would leave the header behind and silently drop the
 * tag while lint, typecheck, format and every other test stayed green.
 *
 * The flag is read once at process start, so each state needs its own process.
 */

// Node runs index.ts and the server graph straight from source, so the
// entry is the one in the repository root. The React Router server build it
// imports on demand is the only build output worth checking for existence,
// because that is what is missing on a tree that never built.
const REACT_ROUTER_BUILD = 'build/server/index.js'
const SERVER_ENTRY = 'index.ts'
const BOOT_TIMEOUT_MS = 30_000

/**
 * NOTE: `ALLOW_INDEXING` is deliberately absent. `spawn` inherits
 * `process.env`, so a developer who exports it in their shell would otherwise
 * silently change what these tests assert; the two runs below set it
 * explicitly.
 */
const BASE_ENV = {
	NODE_ENV: 'production',
	SESSION_SECRET: 'test-session-secret',
	HONEYPOT_SECRET: 'test-honeypot-secret',
	INTERNAL_COMMAND_TOKEN: 'test-command-token',
	SENTRY_DSN: '',
	NODEMAILER_HOST: 'test-host',
	NODEMAILER_USER: 'test-user',
	NODEMAILER_PASSWORD: 'test-password',
	HASHNODE_PUBLICATION_ID: 'test-publication-id',
	HASHNODE_PUBLICATION_HOST: 'test-publication-host',
	POSTHOG_API_KEY: 'test-posthog-key',
	UMAMI_WEBSITE_ID: 'test-umami-id',
	UMAMI_DOMAINS: 'test-umami-domains',
	UMAMI_DOMAIN: 'test-umami-domain',
	UMAMI_SCRIPT_NAME: 'test-umami-script',
	UMAMI_PUBLIC_ANALYTICS_URL: '',
} as const

const servers: ChildProcess[] = []

/** Boots a server with `ALLOW_INDEXING` forced to `value` (or unset). */
async function bootServer(allowIndexing: string | undefined) {
	if (!existsSync(REACT_ROUTER_BUILD)) {
		throw new Error(
			`${REACT_ROUTER_BUILD} is missing. Run \`npm run build\` before this test; the deploy workflow's test job does this.`,
		)
	}

	const port = await getPort({ port: portNumbers(51_000, 59_000) })
	const env = { ...process.env, ...BASE_ENV, PORT: String(port) }
	if (allowIndexing === undefined) {
		delete env.ALLOW_INDEXING
	} else {
		// `envSchema` types this as 'true' | 'false', and the point of the third
		// run is a value the type forbids, so widen it here on purpose.
		env.ALLOW_INDEXING = allowIndexing as NodeJS.ProcessEnv['ALLOW_INDEXING']
	}

	const child = spawn(process.execPath, [SERVER_ENTRY], {
		env,
		stdio: ['ignore', 'pipe', 'pipe'],
	})
	servers.push(child)

	let output = ''
	child.stdout?.on('data', (chunk: Buffer) => (output += chunk.toString()))
	child.stderr?.on('data', (chunk: Buffer) => (output += chunk.toString()))

	// /robots.txt is a resource route whose loader only reads request headers,
	// so it proves the handler is mounted without reaching Hashnode.
	const deadline = Date.now() + BOOT_TIMEOUT_MS
	while (Date.now() < deadline) {
		if (child.exitCode !== null) {
			throw new Error(`server exited during startup\n${output}`)
		}
		try {
			const response = await fetch(`http://127.0.0.1:${port}/robots.txt`, {
				redirect: 'manual',
			})
			if (response.status < 500) return `http://127.0.0.1:${port}`
		} catch {
			// not listening yet
		}
		await new Promise((resolve) => setTimeout(resolve, 250))
	}

	throw new Error(`server did not become ready\n${output}`)
}

afterAll(() => {
	for (const server of servers) server.kill('SIGKILL')
})

describe('ALLOW_INDEXING unset', () => {
	let base = ''

	beforeAll(async () => {
		base = await bootServer(undefined)
	}, 60_000)

	it('is indexable: no header and no meta tag', async () => {
		const response = await fetch(`${base}/talks`)
		expect(response.status).toBe(200)
		expect(response.headers.get('x-robots-tag')).toBeNull()
		expect(await response.text()).not.toContain('name="robots"')
	})
})

describe('ALLOW_INDEXING=false', () => {
	let base = ''

	beforeAll(async () => {
		base = await bootServer('false')
	}, 60_000)

	it('sends X-Robots-Tag: noindex, nofollow', async () => {
		const response = await fetch(`${base}/talks`)
		expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow')
	})

	it('renders the matching meta tag, so both boundaries agree', async () => {
		const response = await fetch(`${base}/talks`)
		expect(await response.text()).toContain(
			'<meta name="robots" content="noindex, nofollow"',
		)
	})

	it('tags a 404 as well, not just a rendered page', async () => {
		const response = await fetch(`${base}/nope-does-not-exist`, {
			redirect: 'manual',
		})
		expect(response.status).toBe(404)
		expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow')
	})
})

describe('ALLOW_INDEXING with a value the server does not recognise', () => {
	// `server/index.ts` treats anything other than the exact string 'false' as
	// "indexing allowed", and `envSchema` has to agree or a typo would fail
	// validation inside `init()`. `init()` runs from the app bundle, which
	// `getBuild()` imports per request behind a catch, so a disagreement here
	// does not fail the boot — it 500s every route with no Sentry event.
	let base = ''

	beforeAll(async () => {
		base = await bootServer('')
	}, 60_000)

	it('boots and serves instead of failing env validation', async () => {
		const response = await fetch(`${base}/talks`)
		expect(response.status).toBe(200)
		expect(response.headers.get('x-robots-tag')).toBeNull()
	})
})
