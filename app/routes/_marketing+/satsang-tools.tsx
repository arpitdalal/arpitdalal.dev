import { captureException } from '@sentry/react'
import { useLoaderData } from 'react-router'
import {
	Card,
	CardContent,
	CardDescription,
	CardTags,
	CardTitle,
} from '#app/components/card'
import { CopyButton } from '#app/components/copy-button'
import { ExternalLink } from '#app/components/external-link'
import {
	HeroHighlight,
	HeroHighlightH1,
	HeroHighlightDescription,
} from '#app/components/highlight'
import { LineGlow } from '#app/components/line-glow'
import { type Route } from './+types/satsang-tools'
import { satsangToolsData, type SatsangTool } from './__data'

export const meta: Route.MetaFunction = () => [
	{ title: 'Satsang Tools | Arpit Dalal' },
]

export async function loader() {
	return {
		satsangTools: satsangToolsData,
	}
}

export default function SatsangTools() {
	const { satsangTools } = useLoaderData<typeof loader>()

	return (
		<>
			<HeroHighlight className="pt-24">
				<div className="flex flex-col items-center justify-between gap-6">
					<HeroHighlightH1>
						<span className="first-letter:text-primary">Satsang</span>
						<span>Tools</span>
					</HeroHighlightH1>
					<HeroHighlightDescription>
						Tools that I made and use to reduce friction.
					</HeroHighlightDescription>
				</div>
			</HeroHighlight>
			<section id="satsang-tools">
				<LineGlow />
				<div className="container pb-12">
					<ol className="relative mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
						{satsangTools.map((satsangTool) => {
							switch (satsangTool.type) {
								case 'calendar':
									return (
										<CalendarSatsangTool
											key={satsangTool.title}
											{...satsangTool}
										/>
									)
								case 'shortcut':
									return (
										<ShortcutSatsangTool
											key={satsangTool.title}
											{...satsangTool}
										/>
									)
								default:
									captureException(
										new Error(
											`Unknown satsang tool type: ${JSON.stringify(
												satsangTool,
											)}`,
										),
									)
									return null
							}
						})}
					</ol>
				</div>
			</section>
		</>
	)
}

function CalendarSatsangTool(
	calendarSatsangToolProps: Omit<SatsangTool, 'type'>,
) {
	return (
		<Card>
			<CardContent>
				<CardTitle
					title={calendarSatsangToolProps.title}
					isNew={calendarSatsangToolProps.isNew}
				/>
				<CardDescription>
					Instructions on subscribing to the calendar:
					<div className="mt-1 flex flex-col gap-1">
						<ExternalLink href="https://support.google.com/calendar/answer/37100?hl=en&co=GENIE.Platform%3DDesktop">
							Google Calendar
						</ExternalLink>
						<ExternalLink href="https://support.apple.com/en-ca/guide/iphone/iph3d1110d4/ios">
							Apple Calendar
						</ExternalLink>
						<ExternalLink href="https://support.microsoft.com/en-us/office/import-or-subscribe-to-a-calendar-in-outlook-com-or-outlook-on-the-web-cff1429c-5af6-41ec-a5b4-74f2c278e98c">
							Outlook Calendar
						</ExternalLink>
					</div>
					<div className="mt-4 flex gap-2">
						<CopyButton
							textToCopy={calendarSatsangToolProps.link}
							text="URL"
							data-umami-event="copy-button-clicked"
							data-umami-event-title={calendarSatsangToolProps.title}
						/>
					</div>
				</CardDescription>
				<CardTags tags={['Calendar']} />
			</CardContent>
		</Card>
	)
}

function ShortcutSatsangTool(
	shortcutSatsangToolProps: Omit<SatsangTool, 'type'>,
) {
	return (
		<Card>
			<CardContent>
				<CardTitle
					title={shortcutSatsangToolProps.title}
					link={shortcutSatsangToolProps.link}
				/>
				<CardDescription>Click to install the shortcut</CardDescription>
				<CardTags tags={['Apple Shortcut']} />
			</CardContent>
		</Card>
	)
}
