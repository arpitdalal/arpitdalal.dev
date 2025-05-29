import { z } from 'zod'
import { gql, GET_NOTES } from '#app/graphql'
import {
	Card,
	CardContent,
	CardDescription,
	CardImage,
	CardTags,
	CardTitle,
} from './card'
import { ExternalLink } from './external-link'
import { Section } from './section'
import { Button } from './ui/button'

export type Note = {
	title: string
	url: string
	coverImage: {
		url: string
	}
	brief: string
	tags: Array<{
		id: string
		name: string
	}>
}

const HashnodeResponseSchema = z.object({
	data: z.object({
		publication: z.object({
			series: z.object({
				posts: z.object({
					edges: z.array(
						z.object({
							node: z.custom<Note>(),
						}),
					),
				}),
			}),
		}),
	}),
})

export async function fetchNotes() {
	try {
		const result = await gql(GET_NOTES)
		if (result.error) {
			console.error('Failed to fetch notes:', result.error)
			return []
		}
		const posts = await result.data.json()
		const parsedPosts = HashnodeResponseSchema.safeParse(posts)
		if (!parsedPosts.success) {
			console.error('Failed to parse Hashnode response: ', parsedPosts.error)
			return []
		}

		const notes = parsedPosts.data.data.publication.series.posts.edges
		return notes.slice(0, 2).map((post) => post.node)
	} catch (error) {
		console.error('Error fetching notes:', error)
		return []
	}
}

export function Notes({
	jsEnabled,
	notes,
}: {
	jsEnabled: boolean
	notes: Note[]
}) {
	if (notes.length === 0) {
		return null
	}

	return (
		<Section id="notes" jsEnabled={jsEnabled} sectionTitle="Notes">
			{notes.map(({ title, url, coverImage, brief, tags }) => (
				<Card key={title}>
					<CardImage
						imageUrl={coverImage.url}
						imageAlt={`Cover image for ${title}`}
					/>
					<CardContent>
						<CardTitle link={url} title={title} />
						<CardDescription>{brief}</CardDescription>
						<CardTags tags={tags.map((tag) => tag.name)} />
					</CardContent>
				</Card>
			))}
			<div className="mt-8 text-center">
				<Button variant="outline" size="lg" asChild>
					<ExternalLink
						href="https://arpit.im/b/notes"
						applyUnderlineClassName={false}
					>
						View all notes
					</ExternalLink>
				</Button>
			</div>
		</Section>
	)
}
