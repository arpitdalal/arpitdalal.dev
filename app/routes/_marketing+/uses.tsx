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
		toolsData: usesData,
	}
}

export default function Uses() {
	const { toolsData } = useLoaderData<typeof loader>()

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
			{toolsData.map((toolContent) => (
				<UseSection key={toolContent.title} toolContent={toolContent} />
			))}
		</>
	)
}

function UseSection({ toolContent }: { toolContent: Use }) {
	return (
		<ClientOnly
			fallback={
				<Section
					id={toolContent.title.toLowerCase()}
					sectionTitle={toolContent.title}
					reduceOpacity={false}
					jsEnabled={false}
				>
					<UseSectionContent toolContent={toolContent} />
				</Section>
			}
		>
			{() => (
				<Section
					id={toolContent.title.toLowerCase()}
					sectionTitle={toolContent.title}
					reduceOpacity={false}
					jsEnabled
				>
					<UseSectionContent toolContent={toolContent} />
				</Section>
			)}
		</ClientOnly>
	)
}

function UseSectionContent({ toolContent }: { toolContent: Use }) {
	return (
		<div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
			{toolContent.toolCards.map((toolCard) => (
				<Card key={toolCard.title}>
					<CardContent>
						<CardTitle title={toolCard.title} link={toolCard.titleLink} />
						<CardDescription>{toolCard.description}</CardDescription>
						{toolCard.subDescription ? (
							<CardDescription className="mt-1 text-sm">
								{toolCard.subDescription}
							</CardDescription>
						) : null}
					</CardContent>
				</Card>
			))}
		</div>
	)
}
