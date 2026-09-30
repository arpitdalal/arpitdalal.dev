import { useEventListener } from '@reactuses/core'
import { captureException } from '@sentry/react'
import { useEffect, type ReactElement } from 'react'
import DinoGame from 'react-chrome-dino-ts'
import reactChromeDinoCss from 'react-chrome-dino-ts/index.css?url'
import {
	type ErrorResponse,
	isRouteErrorResponse,
	useParams,
	useRouteError,
	Link,
	type LinksFunction,
	href,
} from 'react-router'
import { getErrorMessage } from '#app/utils/misc'
import { REJECTED_SUBMISSION } from '#app/utils/rejected-submission'
import { Button } from './ui/button'
import { Icon } from './ui/icon'

type StatusHandler = (info: {
	error: ErrorResponse
	params: Record<string, string | undefined>
}) => ReactElement | null

/**
 * Whether `error` is one this app threw on purpose to answer a request it
 * refuses, rather than a fault.
 *
 * A route can throw a `Response` as a considered answer — `checkHoneypot` and
 * `readFormData` both answer 400 for a submission the site will not accept —
 * and React Router turns that into an `ErrorResponse` at the nearest boundary,
 * exactly as it does for a crash. Without this distinction every such rejection
 * was reported to Sentry from the browser, which is the opposite of the intent:
 * the rejection exists so that junk traffic is cheap and silent, and the
 * newsletter form is in the footer of every page, so one stray POST was enough
 * to file an issue and attach a session replay to an innocent visitor.
 *
 * Narrowed on the status *and* the shared body. The body alone is not enough:
 * anything else in the app that ever answers 500 with this same text would be
 * silenced, and a real fault is exactly what this must not swallow. The status
 * alone is not enough either, because 400 is also what React Router uses for
 * "no matching loader" — a scanner probing for routes, which
 * `sentry-event-filters.ts` already drops server-side, and reporting it here
 * would undo that work. Both together identify the guards' own answer.
 */
export function isRejectedSubmission(error: unknown): boolean {
	return (
		isRouteErrorResponse(error) &&
		error.status === 400 &&
		error.data === REJECTED_SUBMISSION
	)
}
export function GeneralErrorBoundary({
	defaultStatusHandler = ({ error }) => (
		<p>
			{error.status} {error.data}
		</p>
	),
	statusHandlers,
	unexpectedErrorHandler = (error) => <p>{getErrorMessage(error)}</p>,
}: {
	defaultStatusHandler?: StatusHandler
	statusHandlers?: Record<number, StatusHandler>
	unexpectedErrorHandler?: (error: unknown) => ReactElement | null
}) {
	const error = useRouteError()
	const params = useParams()

	useEffect(() => {
		// A considered rejection is an answer, not a fault — see
		// `isRejectedSubmission`. Everything else, including every `ErrorResponse`
		// the router raises itself, is still reported.
		if (isRejectedSubmission(error)) return
		captureException(error)
	}, [error])

	if (typeof document !== 'undefined') {
		// Same reasoning, for the console: a rejected submission is expected
		// traffic and logging it would fill the deploy logs with it.
		if (!isRejectedSubmission(error)) console.error(error)
	}

	return (
		<div className="text-h2 container flex items-center justify-center p-20">
			{isRouteErrorResponse(error)
				? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
						error,
						params,
					})
				: unexpectedErrorHandler(error)}
		</div>
	)
}

export const dinoCssLinks: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: reactChromeDinoCss }]
}

export function NotFound() {
	useEventListener('keydown', (event) => {
		if (event.code === 'Space' && window.innerWidth >= 1024) {
			// lg breakpoint
			event.preventDefault()
		}
	})

	return (
		<>
			<div className="container pt-20">
				<div className="mx-auto flex max-w-max flex-col gap-6 pt-10">
					<div className="flex flex-col gap-3">
						<h1 className="text-h3 md:text-h2">Lost, but not forgotten</h1>
					</div>
					<div>
						<Link
							to={href('/')}
							className="underlined"
							data-content="Te Let's find your way back"
						>
							<Icon name="arrow-left-outline">Let's find your way back</Icon>
						</Link>
					</div>
					<h2>Feel free to play a game while you're here</h2>
				</div>
			</div>
			<DinoGame hideInstructions />
			<div className="container">
				<div className="flex flex-col gap-6 pt-10">
					<p className="text-foreground/70 mt-6 hidden text-center text-base lg:block">
						Press space to start the game and jump.
					</p>
					<div className="flex flex-col items-center gap-3 lg:hidden">
						<p className="text-foreground/70 mt-6 text-center text-base">
							Tap the button below to start/jump
						</p>
						<Button
							variant="secondary"
							onClickCapture={() => {
								const spaceEvent = new KeyboardEvent('keydown', {
									code: 'Space',
									key: ' ',
									keyCode: 32,
									which: 32,
									bubbles: true,
									cancelable: true,
								})
								document.dispatchEvent(spaceEvent)
							}}
						>
							Jump
						</Button>
					</div>
				</div>
			</div>
		</>
	)
}
