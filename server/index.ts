import crypto from 'node:crypto'
import { styleText } from 'node:util'
import { createRequestHandler } from '@react-router/express'
import * as Sentry from '@sentry/node'
import { ip as ipAddress } from 'address'
import closeWithGrace from 'close-with-grace'
import compression from 'compression'
import express from 'express'
import rateLimit, { ipKeyGenerator } from 'express-rate-limit'
import getPort, { portNumbers } from 'get-port'
import helmet from 'helmet'
import morgan from 'morgan'
import { type ServerBuild, RouterContextProvider } from 'react-router'
import { decodeRequestUrl } from './utils/request-url.js'

const MODE = process.env.NODE_ENV ?? 'development'
const IS_PROD = MODE === 'production'
const IS_DEV = MODE === 'development'
const ALLOW_INDEXING = process.env.ALLOW_INDEXING !== 'false'
const SENTRY_ENABLED = IS_PROD && process.env.SENTRY_DSN

if (SENTRY_ENABLED) {
	void import('./utils/monitoring.js').then(({ init }) => init())
}

const viteDevServer = IS_PROD
	? undefined
	: await import('vite').then((vite) =>
			vite.createServer({
				server: { middlewareMode: true },
				// We tell Vite we are running a custom app instead of
				// the SPA default so it doesn't run HTML middleware
				appType: 'custom',
			}),
		)

const app = express()

const getHost = (req: { get: (key: string) => string | undefined }) =>
	req.get('X-Forwarded-Host') ?? req.get('host') ?? ''

// fly is our proxy
app.set('trust proxy', true)

// ensure HTTPS only (X-Forwarded-Proto comes from Fly)
app.use((req, res, next) => {
	const proto = req.get('X-Forwarded-Proto')
	const host = getHost(req)
	if (proto === 'http') {
		res.set('X-Forwarded-Proto', 'https')
		res.redirect(`https://${host}${req.originalUrl}`)
		return
	}
	next()
})

// no ending slashes for SEO reasons
// https://github.com/epicweb-dev/epic-stack/discussions/108
app.get('/{*splat}', (req, res, next) => {
	if (req.path.endsWith('/') && req.path.length > 1) {
		const query = req.url.slice(req.path.length)
		const safepath = req.path.slice(0, -1).replace(/\/+/g, '/')
		res.redirect(302, safepath + query)
	} else {
		next()
	}
})

app.use(compression())

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable('x-powered-by')

if (!ALLOW_INDEXING) {
	app.use((_, res, next) => {
		res.set('X-Robots-Tag', 'noindex, nofollow')
		next()
	})
}

if (viteDevServer) {
	app.use(viteDevServer.middlewares)
} else {
	// Remix fingerprints its assets so we can cache forever.
	app.use(
		'/assets',
		express.static('build/client/assets', { immutable: true, maxAge: '1y' }),
	)

	// Everything else (like favicon.ico) is cached for an hour. You may want to be
	// more aggressive with this caching.
	app.use(express.static('build/client', { maxAge: '1h' }))
}

app.get(['/img/{*splat}', '/favicons/{*splat}'], (_req, res) => {
	// if we made it past the express.static for these, then we're missing something.
	// So we'll just send a 404 and won't bother calling other middleware.
	res.status(404).send('Not found')
	return
})

// Same fallback morgan's own `url` token uses, so mounting morgan at a path
// prefix cannot silently drop the prefix from every log line. morgan types the
// request as a bare IncomingMessage, but Express puts `originalUrl` on it.
morgan.token('url', (req) =>
	decodeRequestUrl((req as express.Request).originalUrl ?? req.url),
)
app.use(
	morgan('tiny', {
		skip: (req, res) =>
			res.statusCode === 200 && req.url?.startsWith('/resources/healthcheck'),
	}),
)

app.use((req, _res, next) => {
	// The CSP nonce is generated here but consumed by app/entry.server.tsx.
	// It travels as a request header rather than through a React context
	// because this server bundle and the app bundle do not share module
	// instances. See the note on getLoadContext below.
	req.headers['x-csp-nonce'] = crypto.randomBytes(16).toString('hex')
	next()
})

app.use(
	helmet({
		xPoweredBy: false,
		referrerPolicy: { policy: 'same-origin' },
		crossOriginEmbedderPolicy: false,
		contentSecurityPolicy: {
			// NOTE: Remove reportOnly when you're ready to enforce this CSP
			reportOnly: true,
			directives: {
				'connect-src': [
					MODE === 'development' ? 'ws:' : null,
					process.env.SENTRY_DSN ? '*.sentry.io' : null,
					"'self'",
				].filter(Boolean),
				'font-src': ["'self'"],
				'frame-src': ["'self'"],
				'img-src': ["'self'", 'data:', '*.cloudinary.com'],
				'script-src': [
					"'strict-dynamic'",
					"'self'",
					(req) => `'nonce-${req.headers['x-csp-nonce']}'`,
				],
				'script-src-attr': [(req) => `'nonce-${req.headers['x-csp-nonce']}'`],
				'upgrade-insecure-requests': null,
			},
		},
	}),
)

// When running tests or running in development, we want to effectively disable
// rate limiting because playwright tests are very fast and we don't want to
// have to wait for the rate limit to reset between tests.
const maxMultiple =
	!IS_PROD || process.env.PLAYWRIGHT_TEST_BASE_URL ? 10_000 : 1
const rateLimitDefault = {
	windowMs: 60 * 1000,
	limit: 1000 * maxMultiple,
	standardHeaders: true,
	legacyHeaders: false,
	validate: { trustProxy: false },
	// Malicious users can spoof their IP address which means we should not default
	// to trusting req.ip when hosted on Fly.io. However, users cannot spoof Fly-Client-Ip.
	// When sitting behind a CDN such as cloudflare, replace fly-client-ip with the CDN
	// specific header such as cf-connecting-ip
	keyGenerator: (req: express.Request) => {
		const flyClientIp = req.get('fly-client-ip')
		if (flyClientIp) {
			return flyClientIp
		}
		return ipKeyGenerator(req.ip || 'unknown')
	},
}

const strongestRateLimit = rateLimit({
	...rateLimitDefault,
	windowMs: 60 * 1000,
	limit: 10 * maxMultiple,
})

const strongRateLimit = rateLimit({
	...rateLimitDefault,
	windowMs: 60 * 1000,
	limit: 100 * maxMultiple,
})

const generalRateLimit = rateLimit(rateLimitDefault)
app.use((req, res, next) => {
	const strongPaths = ['/contact', '/resources/newsletter']
	if (req.method !== 'GET' && req.method !== 'HEAD') {
		if (strongPaths.some((p) => req.path.includes(p))) {
			return strongestRateLimit(req, res, next)
		}
		return strongRateLimit(req, res, next)
	}

	return generalRateLimit(req, res, next)
})

async function getBuild() {
	try {
		const build = viteDevServer
			? await viteDevServer.ssrLoadModule('virtual:react-router/server-build')
			: // @ts-ignore - the file might not exist yet but it will
				await import('../build/server/index.js')
		return { build: build as unknown as ServerBuild, error: null }
	} catch (error) {
		// Catch error and return null to make express happy and avoid an unrecoverable crash
		console.error('Error creating build:', error)
		return { error: error, build: null as unknown as ServerBuild }
	}
}

// Express 5 moved to path-to-regexp v8, which rejects the bare '*' wildcard.
// The catch-all has to be named, and '/{*splat}' rather than '/*splat' so it
// also matches the site root.
app.all(
	'/{*splat}',
	createRequestHandler({
		// React Router 8 made middleware unconditional, so getLoadContext must
		// return a RouterContextProvider rather than a plain object. The CSP
		// nonce travels on the request header instead of through a React
		// context: this file is bundled separately from the app by esbuild, so
		// a createContext() symbol created here would be a different instance
		// from the one the app's loaders import.
		getLoadContext: () => new RouterContextProvider(),
		mode: MODE,
		build: async () => {
			const { error, build } = await getBuild()
			// gracefully "catch" the error
			if (error) {
				throw error
			}
			return build
		},
	}),
)

const desiredPort = Number(process.env.PORT || 3000)
const portToUse = await getPort({
	port: portNumbers(desiredPort, desiredPort + 100),
})
const portAvailable = desiredPort === portToUse
if (!portAvailable && !IS_DEV) {
	console.log(`⚠️ Port ${desiredPort} is not available.`)
	process.exit(1)
}

const server = app.listen(portToUse, () => {
	if (!portAvailable) {
		console.warn(
			styleText(
				'yellow',
				`⚠️  Port ${desiredPort} is not available, using ${portToUse} instead.`,
			),
		)
	}
	console.log(`🚀  We have liftoff!`)
	const localUrl = `http://localhost:${portToUse}`
	let lanUrl: string | null = null
	const localIp = ipAddress() ?? 'Unknown'
	// Check if the address is a private ip
	// https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces
	// https://github.com/facebook/create-react-app/blob/d960b9e38c062584ff6cfb1a70e1512509a966e7/packages/react-dev-utils/WebpackDevServerUtils.js#LL48C9-L54C10
	if (/^10[.]|^172[.](1[6-9]|2[0-9]|3[0-1])[.]|^192[.]168[.]/.test(localIp)) {
		lanUrl = `http://${localIp}:${portToUse}`
	}

	console.log(
		`
${styleText('bold', 'Local:')}            ${styleText('cyan', localUrl)}
${lanUrl ? `${styleText('bold', 'On Your Network:')}  ${styleText('cyan', lanUrl)}` : ''}
${styleText('bold', 'Press Ctrl+C to stop')}
		`.trim(),
	)
})

closeWithGrace(async ({ err }) => {
	await new Promise((resolve, reject) => {
		server.close((e) => (e ? reject(e) : resolve('ok')))
	})
	if (err) {
		console.error(styleText('red', String(err)))
		console.error(styleText('red', String(err.stack)))
		if (SENTRY_ENABLED) {
			Sentry.captureException(err)
			await Sentry.flush(500)
		}
	}
})
