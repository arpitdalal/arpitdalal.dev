import { href, Link } from 'react-router'
import { Section } from '#app/components/section'
import { TalkCard } from '#app/components/talk-card'
import { Button } from '#app/components/ui/button'
import { type Talk } from '#app/routes/_marketing+/__data'

export function TalksSection({
	talks,
	jsEnabled,
}: {
	talks: Array<Talk & { formattedDate: string }>
	jsEnabled: boolean
}) {
	if (talks.length === 0) {
		return null
	}

	return (
		<Section id="talks" jsEnabled={jsEnabled} sectionTitle="Talks">
			{talks.map((talk) => (
				<TalkCard key={talk.slug} talk={talk} />
			))}
			<div className="mt-8 text-center">
				<Button variant="outline" size="lg" asChild>
					<Link to={href('/talks')} data-umami-event="home-talks-view-all">
						View all talks
					</Link>
				</Button>
			</div>
		</Section>
	)
}
