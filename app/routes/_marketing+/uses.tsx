import { useLoaderData } from 'react-router'
import { ClientOnly } from 'remix-utils/client-only'
import {
	Card,
	CardContent,
	CardDescription,
	CardTitle,
} from '#app/components/card'
import {
	HeroHighlight,
	HeroHighlightDescription,
	HeroHighlightH1,
} from '#app/components/highlight'
import { Section } from '#app/components/section'
import { type Route } from './+types/uses'
import { usesData, type Use } from './__data'

export const meta: Route.MetaFunction = () => [
	{ title: 'What Arpit uses | Arpit Dalal' },
]

export async function loader() {
	return {
		uses: usesData,
	}
}

export default function Uses() {
	const { uses } = useLoaderData<typeof loader>()

	return (
		<>
			<HeroHighlight className="pt-24">
				<div className="flex flex-col items-center justify-between gap-6">
					<HeroHighlightH1>
						<span>What</span>
						<span className="first-letter:text-primary">Arpit</span>
						<span>uses</span>
					</HeroHighlightH1>
					<HeroHighlightDescription>
						The tools and technologies I use daily.
					</HeroHighlightDescription>
				</div>
			</HeroHighlight>
			{uses.map((use) => (
				<UseSection key={use.title} use={use} />
			))}
		</>
	)
}

function UseSection({ use }: { use: Use }) {
	return (
		<ClientOnly
			fallback={
				<Section
					id={use.title.toLowerCase()}
					sectionTitle={use.title}
					reduceOpacity={false}
					jsEnabled={false}
				>
					<UseSectionContent use={use} />
				</Section>
			}
		>
			{() => (
				<Section
					id={use.title.toLowerCase()}
					sectionTitle={use.title}
					reduceOpacity={false}
					jsEnabled
				>
					<UseSectionContent use={use} />
				</Section>
			)}
		</ClientOnly>
	)
}

function UseSectionContent({ use }: { use: Use }) {
	return (
		<div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
			{use.useCard.map((card) => (
				<Card key={card.title}>
					<CardContent>
						<CardTitle title={card.title} link={card.titleLink} />
						<CardDescription>{card.description}</CardDescription>
						{card.subDescription ? (
							<CardDescription className="mt-1 text-sm">
								{card.subDescription}
							</CardDescription>
						) : null}
					</CardContent>
				</Card>
			))}
		</div>
	)
}
