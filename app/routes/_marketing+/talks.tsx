import * as React from 'react'
import { useLoaderData, useLocation } from 'react-router'
import {
	HeroHighlight,
	HeroHighlightDescription,
	HeroHighlightH1,
} from '#app/components/highlight'
import { LineGlow } from '#app/components/line-glow'
import { TalkCard } from '#app/components/talk-card'
import { type loader as rootLoader } from '#app/root'
import { formatDateWithHints } from '#app/utils/client-hints'
import { getUrl } from '#app/utils/misc'
import { getSocialMetas } from '#app/utils/seo'
import { type Route } from './+types/talks'
import { talksData } from './__data'

const PAGE_TITLE = 'Talks | Arpit Dalal'
const PAGE_DESCRIPTION =
	'Presentations and talks I have given at meetups and conferences.'

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
						Presentations and talks I have given at meetups and conferences.
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
