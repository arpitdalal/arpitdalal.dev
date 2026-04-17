import * as React from 'react'
import { useLoaderData, useLocation } from 'react-router'
import {
	Card,
	CardContent,
	CardDescription,
	CardTags,
	CardTitle,
} from '#app/components/card'
import { ExternalLink } from '#app/components/external-link'
import {
	HeroHighlight,
	HeroHighlightDescription,
	HeroHighlightH1,
} from '#app/components/highlight'
import { LineGlow } from '#app/components/line-glow'
import { type loader as rootLoader } from '#app/root'
import { formatDateWithHints } from '#app/utils/client-hints'
import { getUrl } from '#app/utils/misc'
import { getSocialMetas } from '#app/utils/seo'
import { type Route } from './+types/talks'
import { talksData, type Talk } from './__data'

const PAGE_TITLE = 'Talks | Arpit Dalal'
const PAGE_DESCRIPTION =
	'Conference and community talks: slides, recordings, and notes.'

export const meta: Route.MetaFunction = ({ matches }) => {
	const rootMatch = matches.find((m) => m?.id === 'root')
	const rootData = rootMatch?.loaderData as
		| Awaited<ReturnType<typeof rootLoader>>
		| undefined
	const requestInfo = rootData?.requestInfo
	return [
		{ title: PAGE_TITLE },
		...getSocialMetas({
			title: PAGE_TITLE,
			description: PAGE_DESCRIPTION,
			url: getUrl(requestInfo),
			keywords:
				'Talks, Presentations, Slides, React, TypeScript, Web development',
		}),
	]
}

export async function loader({ request }: Route.LoaderArgs) {
	const sorted = [...talksData].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	)
	const talks = sorted.map((talk) => ({
		...talk,
		formattedDate: formatDateWithHints(talk.date, request),
	}))
	return { talks }
}

export default function Talks() {
	const { talks } = useLoaderData<typeof loader>()
	const location = useLocation()

	React.useEffect(() => {
		const raw = location.hash.slice(1)
		if (!raw) return
		const id = decodeURIComponent(raw)
		const run = () => {
			const el = document.getElementById(id)
			if (el instanceof HTMLLIElement && el.tabIndex === -1) {
				el.focus({ preventScroll: true })
			}
		}
		requestAnimationFrame(run)
	}, [location.hash])

	return (
		<>
			<HeroHighlight className="pt-24">
				<div className="flex flex-col items-center justify-between gap-6">
					<HeroHighlightH1>
						<span className="first-letter:text-primary">Talks</span>
					</HeroHighlightH1>
					<HeroHighlightDescription>
						Presentations, meetups, and conference sessions I have given.
					</HeroHighlightDescription>
				</div>
			</HeroHighlight>
			<section id="talks">
				<LineGlow />
				<div className="container pb-12">
					<ol className="relative mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
						{talks.map((talk) => (
							<TalkCard key={talk.slug} talk={talk} />
						))}
					</ol>
				</div>
			</section>
		</>
	)
}

function TalkCard({
	talk,
}: {
	talk: Talk & { formattedDate: string }
}) {
	return (
		<Card
			id={talk.slug}
			tabIndex={-1}
			className="scroll-mt-28 outline-none target:ring-primary target:ring-offset-background rounded-md target:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.15)] target:ring-2 target:ring-offset-2 focus-visible:ring-primary focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2"
		>
			<CardContent>
				<CardTitle title={talk.title} />
				<CardDescription className="mt-1 text-sm">
					<time dateTime={talk.date}>{talk.formattedDate}</time>
					{talk.venue ? (
						<>
							{' '}
							<span aria-hidden>·</span> {talk.venue}
						</>
					) : null}
				</CardDescription>
				<CardDescription>{talk.description}</CardDescription>
				<CardTags tags={talk.tags} />
				{talk.links.length > 0 ? (
					<ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-label="Links">
						{talk.links.map((link) => (
							<li key={`${link.label}-${link.href}`}>
								<ExternalLink
									href={link.href}
									aria-label={`${link.label} (opens in a new tab)`}
									applyUnderlineClassName={false}
								>
									{link.label}
								</ExternalLink>
							</li>
						))}
					</ul>
				) : null}
			</CardContent>
		</Card>
	)
}
