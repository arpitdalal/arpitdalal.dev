import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
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

const PORT = 3987
const BASE = `http://127.0.0.1:${PORT}`
const BUILD_OUTPUT = 'build/server/index.js'
const BOOT_TIMEOUT_MS = 30_000

let server: ChildProcess | undefined

async function waitForServer(url: string, deadline: number) {
	// The healthcheck route is the cheapest thing that proves both that the
	// server is listening and that the React Router handler is mounted.
	while (Date.now() < deadline) {
		try {
			const response = await fetch(url, { redirect: 'manual' })
			if (response.status < 500) return
		} catch {
			// not up yet
		}
		await new Promise((resolve) => setTimeout(resolve, 250))
	}
	throw new Error(`server did not become ready at ${url}`)
}

beforeAll(async () => {
	if (!existsSync(BUILD_OUTPUT)) {
		throw new Error(
			`${BUILD_OUTPUT} is missing. Run \`npm run build\` before this test; the deploy workflow's test job does this.`,
		)
	}

	server = spawn(
		process.execPath,
		['--env-file=.env', 'server-build/index.js'],
		{
			env: { ...process.env, NODE_ENV: 'production', PORT: String(PORT) },
			stdio: 'ignore',
		},
	)

	await waitForServer(
		`${BASE}/resources/healthcheck`,
		Date.now() + BOOT_TIMEOUT_MS,
	)
}, 60_000)

afterAll(() => {
	server?.kill('SIGKILL')
})

describe('production server', () => {
	it('serves the marketing pages', async () => {
		for (const path of [
			'/',
			'/talks',
			'/uses',
			'/contact',
			'/subscribe',
			'/satsang-tools',
			'/terms',
			'/privacy',
		]) {
			const response = await fetch(`${BASE}${path}`)
			expect(response.status, `${path} should render`).toBe(200)
		}
	})

	it('404s an unknown path rather than serving the app shell', async () => {
		const response = await fetch(`${BASE}/nope-does-not-exist`)
		expect(response.status).toBe(404)
	})

	// Guards the path-to-regexp v8 migration: these routes were all bare '*'
	// wildcards, which Express 5 throws on at startup.
	it('redirects a trailing slash without a trailing slash', async () => {
		const response = await fetch(`${BASE}/talks/`, { redirect: 'manual' })
		expect(response.status).toBe(302)
		expect(response.headers.get('location')).toBe('/talks')
	})

	it('404s missing files under /img and /favicons', async () => {
		for (const path of ['/img/missing.png', '/favicons/missing.ico']) {
			const response = await fetch(`${BASE}${path}`)
			expect(response.status, `${path} should 404`).toBe(404)
		}
	})

	it('serves the sitemap built from the server route manifest', async () => {
		const response = await fetch(`${BASE}/sitemap.xml`)
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
		const response = await fetch(`${BASE}/robots.txt`)
		expect(response.status).toBe(200)
		expect(await response.text()).toContain('/sitemap.xml')
	})

	it('sets a CSP with a per-request nonce', async () => {
		// helmet is configured with reportOnly, so the policy lands in
		// Content-Security-Policy-Report-Only rather than the enforcing header.
		const cspHeader = 'content-security-policy-report-only'

		const first = await fetch(`${BASE}/`)
		const firstCsp = first.headers.get(cspHeader) ?? ''

		const second = await fetch(`${BASE}/`)
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

	it('sets rate limit headers', async () => {
		const response = await fetch(`${BASE}/`)
		expect(response.headers.get('ratelimit-limit')).toBeTruthy()
	})
})
