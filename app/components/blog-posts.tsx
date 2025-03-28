import { GET_BLOG_POSTS } from '#app/graphql/queries'
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
}

type HashnodeResponse = {
	data: {
		publication: {
			posts: {
				edges: Array<{
					node: BlogPost
				}>
			}
		}
	}
}

export async function fetchBlogPosts() {
	const response = await fetch('https://gql.hashnode.com', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: GET_BLOG_POSTS,
		}),
	})

	const { data } = (await response.json()) as HashnodeResponse
	return data.publication.posts.edges.map((edge) => edge.node)
}

export function BlogPosts({
	jsEnabled,
	blogPosts,
}: {
	jsEnabled: boolean
	blogPosts: BlogPost[]
}) {
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
