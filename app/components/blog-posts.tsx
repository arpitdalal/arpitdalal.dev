import { GET_BLOG_POSTS } from "#app/graphql/queries";
import { Card } from "./card";
import { Section } from "./section";

export type BlogPost = {
  title: string;
  url: string;
  coverImage: {
    url: string;
  };
  brief: string;
  tags: Array<{
    name: string;
  }>;
};

type HashnodeResponse = {
  data: {
    publication: {
      posts: {
        edges: Array<{
          node: BlogPost;
        }>;
      };
    };
  };
};

export async function fetchBlogPosts() {
  const response = await fetch("https://gql.hashnode.com", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: GET_BLOG_POSTS,
    }),
  });

  const { data } = (await response.json()) as HashnodeResponse;
  return data.publication.posts.edges.map((edge) => edge.node);
}

export function BlogPosts({
  jsEnabled,
  blogPosts,
}: {
  jsEnabled: boolean;
  blogPosts: BlogPost[];
}) {
  return (
    <Section id="blog" jsEnabled={jsEnabled} sectionTitle="Blog Posts">
      {blogPosts.map((post) => (
        <Card
          key={post.title}
          title={post.title}
          link={post.url}
          imageUrl={post.coverImage.url}
          imageAlt={`Cover image for ${post.title}`}
          description={post.brief}
          tags={post.tags.map((tag) => tag.name)}
        />
      ))}
    </Section>
  );
}
