import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import getPort, { portNumbers } from 'get-port'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Boots the production server and exercises the routes that depend on the
 * Express wiring rather than on React Router.
 *
 * This exists because the Express 5 upgrade broke two of them and nothing
 * caught it: `npm run build` never boots the server, and the unit tests never
 * import a route. The bare '*' wildcards that path-to-regexp v8 rejects threw
 * at startup, and the sitemap resource route 500'd. Both were only visible by
 * starting the process and making a request.
 */

// Readiness is probed on /robots.txt rather than /resources/healthcheck.
// The healthcheck loader issues a HEAD request to `/`, whose loader awaits
// fetchBlogPosts() and fetchNotes() — outbound calls to gql.hashnode.com with
// no timeout. Gating startup on that made the test depend on a third party
// being reachable and fast. /robots.txt is a resource route whose loader only
// reads request headers, so it still proves the React Router handler is
// mounted without touching the network.

let port = 0
let base = ''
const BUILD_OUTPUT = 'build/server/index.js'
const BOOT_TIMEOUT_MS = 30_000

/**
 * Every variable app/utils/env.server.ts validates, supplied here rather than
 * read from a file. `.env` is gitignored and the deploy workflow's test job
 * does not create one, so `--env-file=.env` made Node exit before listening.
 * Keeping the values inline also stops the test depending on a developer's
 * local file, and SENTRY_DSN is left empty so Sentry never initialises and
 * the test makes no outbound requests.
 */
const TEST_ENV = {
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

let server: ChildProcess | undefined
let serverOutput = ''

async function waitForServer(url: string, child: ChildProcess) {
	// The healthcheck route is the cheapest thing that proves both that the
	// server is listening and that the React Router handler is mounted.
	const deadline = Date.now() + BOOT_TIMEOUT_MS
	let lastStatus: number | undefined

	while (Date.now() < deadline) {
		// A crash at startup is the other common failure, so surface that
		// immediately instead of waiting out the whole timeout.
		if (child.exitCode !== null || child.signalCode !== null) {
			throw new Error(
				`server exited during startup (code ${child.exitCode}, signal ${child.signalCode})\n${serverOutput}`,
			)
		}
		try {
			const response = await fetch(url, { redirect: 'manual' })
			if (response.status < 500) return
			// Listening but unhealthy: keep the status so the timeout below can
			// say the server was up but failing.
			lastStatus = response.status
		} catch {
			// not listening yet
		}
		await new Promise((resolve) => setTimeout(resolve, 250))
	}

	const listening =
		lastStatus === undefined
			? 'never accepted a connection'
			: `last responded ${lastStatus}`
	throw new Error(
		`server did not become ready at ${url} (${listening})\n${serverOutput}`,
	)
}

beforeAll(async () => {
	if (!existsSync(BUILD_OUTPUT)) {
		throw new Error(
			`${BUILD_OUTPUT} is missing. Run \`npm run build\` before this test; the deploy workflow's test job does this.`,
		)
	}

	// server/index.ts calls process.exit(1) when the requested port is taken
	// and NODE_ENV is production, which is exactly how this server runs. Ask
	// for a free port up front so a collision with another process, or with a
	// previous run whose SIGKILL has not been reaped yet, cannot fail the run.
	port = await getPort({ port: portNumbers(41_000, 49_000) })
	base = `http://127.0.0.1:${port}`

	const env = { ...process.env, ...TEST_ENV, PORT: String(port) }
	// `spawn` inherits `process.env`, and TEST_ENV does not mention
	// ALLOW_INDEXING. A developer who exports it would otherwise make the
	// "sends no X-Robots-Tag by default" test below fail on their machine only.
	delete env.ALLOW_INDEXING

	const child = spawn(process.execPath, ['index.ts'], {
		env,
		stdio: ['ignore', 'pipe', 'pipe'],
	})
	server = child

	child.stdout?.on('data', (chunk: Buffer) => {
		serverOutput += chunk.toString()
	})
	child.stderr?.on('data', (chunk: Buffer) => {
		serverOutput += chunk.toString()
	})

	await waitForServer(`${base}/robots.txt`, child)
}, 60_000)

afterAll(() => {
	server?.kill('SIGKILL')
})

describe('production server', () => {
	// Every page here except `/` has a purely local loader. The homepage calls
	// fetchBlogPosts() and fetchNotes(), which reach gql.hashnode.com with no
	// timeout, so it gets its own test with a generous budget: a slow third
	// party should not fail the run, and the loader already falls back to empty
	// data on error.
	const LOCAL_PAGES = [
		'/talks',
		'/uses',
		'/contact',
		'/subscribe',
		'/satsang-tools',
		'/terms',
		'/privacy',
	]

	it('serves the marketing pages', async () => {
		for (const path of LOCAL_PAGES) {
			const response = await fetch(`${base}${path}`)
			expect(response.status, `${path} should render`).toBe(200)
		}
	})

	it('serves the homepage', { timeout: 30_000 }, async () => {
		const response = await fetch(`${base}/`)
		expect(response.status).toBe(200)
	})

	// React Router short-circuits these before any loader runs, so the root
	// loader never produced data. The document still has to render the error
	// boundary, and `useRequestInfo` used to assert the data was there — which
	// turned a 405 into a 500 and buried the real cause. Scanners send these
	// constantly.
	it('answers an unsupported method with 405, not 500', async () => {
		for (const method of ['POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']) {
			const response = await fetch(`${base}/talks`, {
				method,
				redirect: 'manual',
			})
			expect(response.status, `${method} /talks`).toBe(405)
		}
	})

	it('404s an unknown path rather than serving the app shell', async () => {
		const response = await fetch(`${base}/nope-does-not-exist`)
		expect(response.status).toBe(404)
	})

	// Guards the path-to-regexp v8 migration: these routes were all bare '*'
	// wildcards, which Express 5 throws on at startup.
	it('redirects a trailing slash without a trailing slash', async () => {
		const response = await fetch(`${base}/talks/`, { redirect: 'manual' })
		expect(response.status).toBe(302)
		expect(response.headers.get('location')).toBe('/talks')
	})

	it('404s missing files under /img and /favicons', async () => {
		for (const path of ['/img/missing.png', '/favicons/missing.ico']) {
			const response = await fetch(`${base}${path}`)
			expect(response.status, `${path} should 404`).toBe(404)
		}
	})

	it('serves the sitemap built from the server route manifest', async () => {
		const response = await fetch(`${base}/sitemap.xml`)
		expect(response.status).toBe(200)
		expect(response.headers.get('content-type')).toContain('application/xml')

		const body = await response.text()
		expect(body).toContain('<urlset')
		// Real routes must be present, not just a well-formed empty shell.
		// getDomainUrl forces https for any host that is not "localhost", and
		// these tests bind to 127.0.0.1, so match the path rather than the
		// absolute prefix.
		for (const path of ['/talks', '/contact', '/uses']) {
			expect(body).toMatch(new RegExp(`<loc>https?://[^<]*${path}</loc>`))
		}
	})

	it('serves robots.txt pointing at the sitemap', async () => {
		const response = await fetch(`${base}/robots.txt`)
		expect(response.status).toBe(200)
		expect(await response.text()).toContain('/sitemap.xml')
	})

	it('sets a CSP with a per-request nonce', async () => {
		// helmet is configured with reportOnly, so the policy lands in
		// Content-Security-Policy-Report-Only rather than the enforcing header.
		const cspHeader = 'content-security-policy-report-only'

		// A page with a local loader, so these wiring assertions never wait on
		// Hashnode. The assertions are about the server, not page content.
		const first = await fetch(`${base}/talks`)
		const firstCsp = first.headers.get(cspHeader) ?? ''

		const second = await fetch(`${base}/talks`)
		const secondCsp = second.headers.get(cspHeader) ?? ''

		// The nonce is generated per request and has to reach both the CSP
		// header and the rendered document. These used to come from two places:
		// res.locals for the header and the load context for the document.
		const nonceOf = (csp: string) => csp.match(/'nonce-([^']+)'/)?.[1]
		const nonce = nonceOf(firstCsp)

		expect(nonce, 'CSP should carry a nonce').toBeTruthy()
		expect(nonceOf(secondCsp), 'nonce should differ per request').not.toBe(
			nonce,
		)
		expect(await first.text()).toContain(`nonce="${nonce}"`)
	})

	it('allows Umami connect-src and nonces the tracker script', async () => {
		// Without both, the tracker either fails to load (strict-dynamic + no
		// nonce) or loads and then fails to POST pageviews (connect-src).
		// TEST_ENV sets UMAMI_DOMAIN to test-umami-domain.
		const response = await fetch(`${base}/talks`)
		const csp =
			response.headers.get('content-security-policy-report-only') ?? ''
		const body = await response.text()
		const umamiScript = body.match(
			/<script\b[^>]*src="https:\/\/test-umami-domain\/test-umami-script"[^>]*>/,
		)?.[0]

		expect(csp).toContain('https://test-umami-domain')
		expect(umamiScript, 'Umami script tag').toBeTruthy()
		expect(umamiScript).toMatch(/nonce="[^"]+"/)
	})

	it('allows the Hashnode CDN in img-src for blog and notes cover images', async () => {
		// The policy only allowed cloudinary, so every coverImage.url served by
		// the Hashnode GraphQL API was refused by img-src.
		const response = await fetch(`${base}/talks`)
		const csp =
			response.headers.get('content-security-policy-report-only') ?? ''

		expect(csp).toMatch(/img-src[^;]*\*\.hashnode\.com/)
	})

	it('ships the CSP capture script first in the head, nonced', async () => {
		// Parse-time violations fire before entry.client.tsx dynamically
		// imports monitoring, so the listener has to be inline in <head>. If
		// this regresses, CSP violations go back to being console-only.
		const response = await fetch(`${base}/talks`)
		const body = await response.text()
		const csp =
			response.headers.get('content-security-policy-report-only') ?? ''
		const nonce = csp.match(/'nonce-([^']+)'/)?.[1]

		expect(nonce, 'server should issue a nonce').toBeTruthy()

		const head = body.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? ''
		const firstScript = head.match(/<script[^>]*>/)?.[0] ?? ''

		expect(firstScript, 'first element in <head>').toContain('nonce=')
		expect(body).toContain('securitypolicyviolation')
	})

	it('ignores a client-supplied CSP nonce', async () => {
		// The nonce now travels as a request header, which means a client can
		// send one. The middleware must overwrite it before Helmet and the
		// renderer read it, otherwise an attacker could supply a known nonce
		// and have their own script allowed by the policy.
		const attackerNonce = 'attacker-controlled-nonce'
		const response = await fetch(`${base}/talks`, {
			headers: { 'x-csp-nonce': attackerNonce },
		})

		const csp =
			response.headers.get('content-security-policy-report-only') ?? ''
		const body = await response.text()

		expect(csp).not.toContain(attackerNonce)
		expect(body).not.toContain(`nonce="${attackerNonce}"`)

		const serverNonce = csp.match(/'nonce-([^']+)'/)?.[1]
		expect(serverNonce, 'server should still issue a nonce').toBeTruthy()
		expect(serverNonce).not.toBe(attackerNonce)
		expect(body).toContain(`nonce="${serverNonce}"`)
	})

	it('sets rate limit headers', async () => {
		const response = await fetch(`${base}/talks`)
		expect(response.headers.get('ratelimit-limit')).toBeTruthy()
	})

	it('reports Server-Timing for both the root loader and the render', async () => {
		// The root loader's metric only reaches the client because
		// `app/root.tsx` exports a `headers` function. React Router ignores a
		// loader's response headers on the document without one, so dropping
		// that export silently costs half the instrumentation and nothing else
		// would notice.
		const response = await fetch(`${base}/talks`)
		const serverTiming = response.headers.get('server-timing') ?? ''

		expect(serverTiming).toContain('root_loader')
		expect(serverTiming).toContain('render')
	})

	it('sends no X-Robots-Tag by default', async () => {
		// ALLOW_INDEXING is unset for this server. The noindex behaviour is
		// covered in tests/allow-indexing.test.ts, which boots its own process.
		const response = await fetch(`${base}/talks`)
		expect(response.headers.get('x-robots-tag')).toBeNull()
		expect(await response.text()).not.toContain('name="robots"')
	})

	// The morgan `url` token decodes the whole request URL, query string
	// included. morgan evaluates its tokens from the response's `finished`
	// event with no try/catch, so a URIError there escapes as an uncaught
	// exception and the process exits mid-request. Verified against `main`:
	// this request kills the server, and the guard in
	// `server/utils/request-url.ts` is what keeps it alive.
	//
	// The malformed value has to be in the query. A malformed *path* is thrown
	// on by Express's own `decodeParam` before it reaches morgan, which returns
	// a 400 and never evaluates the token, so that path cannot exercise this.
	it('survives a query string with a malformed percent-encoding', async () => {
		const response = await fetch(`${base}/talks?x=%`, { redirect: 'manual' })
		expect(response.status).toBe(200)

		// The uncaught throw lands on the `finished` event, which races the
		// client's response resolving, so give the process a moment to die
		// before asserting it is still up.
		await new Promise((resolve) => setTimeout(resolve, 500))
		expect(
			server?.exitCode,
			`server should still be running${serverOutput ? `\n${serverOutput}` : ''}`,
		).toBeNull()

		const after = await fetch(`${base}/talks`)
		expect(after.status).toBe(200)
	})
})
