import { createRequestHandler } from '@react-router/express'
import express from 'express'
import { RouterContextProvider } from 'react-router'

/**
 * The React Router request handler, and nothing else.
 *
 * This module is the entry of the SSR build, so in production it is bundled
 * into build/server/index.js and the Express app in server/index.ts mounts it
 * from there. In development it is loaded through Vite instead, which is what
 * lets `virtual:react-router/server-build` resolve. Keeping it in one module
 * means there is a single handler definition to keep in step with the build.
 */
export const app = express()

app.use(
	createRequestHandler({
		mode: process.env.NODE_ENV ?? 'development',
		build: () => import('virtual:react-router/server-build'),
		// React Router 8 made middleware unconditional, so getLoadContext must
		// return a RouterContextProvider rather than a plain object. The CSP
		// nonce travels on the request header instead of through a React
		// context: the Express middleware that sets it is loaded by Node while
		// this module is bundled by Vite, so a createContext() symbol created
		// there would be a different instance from the one the app's loaders
		// import. See the note on getLoadContext in server/index.ts.
		getLoadContext: () => new RouterContextProvider(),
	}),
)
