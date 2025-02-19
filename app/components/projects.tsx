import { type Project } from '#app/routes/_marketing+/__data'
import {
	Card,
	CardContent,
	CardDescription,
	CardImage,
	CardTags,
	CardTitle,
} from './card'
import { Section } from './section'

export function Projects({
	projects,
	jsEnabled,
}: {
	projects: Project[]
	jsEnabled: boolean
}) {
	return (
		<Section id="projects" jsEnabled={jsEnabled} sectionTitle="Projects">
			{projects.map(
				({ title, link, imageUrl, imageAlt, description, tags }) => (
					<Card key={title}>
						<CardImage imageUrl={imageUrl} imageAlt={imageAlt} />
						<CardContent>
							<CardTitle link={link} title={title} />
							<CardDescription>{description}</CardDescription>
							{tags && tags.length > 0 && <CardTags tags={tags} />}
						</CardContent>
					</Card>
				),
			)}
		</Section>
	)
}
