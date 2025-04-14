import { z } from 'zod'
import { GET_BLOG_POSTS } from '#app/graphql/queries'
import { tryCatch } from '#app/utils/misc'
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

export type BlogPost = {
	title: string
	url: string
	coverImage: {
		url: string
	}
	brief: string
	tags: Array<{
		name: string
	}>
	series?: {
		slug: string
	}
}

const HashnodeResponseSchema = z.object({
	data: z.object({
		publication: z.object({
			posts: z.object({
				edges: z.array(
					z.object({
						node: z.custom<BlogPost>(),
					}),
				),
			}),
		}),
	}),
})

export async function fetchBlogPosts() {
	try {
		const result = await tryCatch(
			fetch('https://gql.hashnode.com', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					query: GET_BLOG_POSTS,
				}),
			}),
		)
		if (result.error) {
			console.error('Failed to fetch blog posts:', result.error)
			return []
		}
		const posts = await result.data.json()
		const parsedPosts = HashnodeResponseSchema.safeParse(posts)
		if (!parsedPosts.success) {
			console.error('Failed to parse Hashnode response: ', parsedPosts.error)
			return []
		}

		const blogPosts = parsedPosts.data.data.publication.posts.edges.filter(
			(post) => post.node?.series?.slug !== 'notes',
		)
		return blogPosts.slice(0, 2).map((post) => post.node)
	} catch (error) {
		console.error('Error fetching blog posts:', error)
		return []
	}
}

export function BlogPosts({
	jsEnabled,
	blogPosts,
}: {
	jsEnabled: boolean
	blogPosts: BlogPost[]
}) {
	if (blogPosts.length === 0) {
		return null
	}

	return (
		<Section id="blog" jsEnabled={jsEnabled} sectionTitle="Articles">
			{blogPosts.map(({ title, url, coverImage, brief, tags }) => (
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
						href="https://arpit.im/b"
						applyUnderlineClassName={false}
					>
						View all articles
					</ExternalLink>
				</Button>
			</div>
		</Section>
	)
}
