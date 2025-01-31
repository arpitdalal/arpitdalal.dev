export const GET_BLOG_POSTS = `
  query GetBlogPosts {
    publication(host: "${process.env.HASHNODE_PUBLICATION_ID}") {
      posts(first: 10) {
        edges {
          node {
            title
            brief
            url
            coverImage {
              url
            }
            tags {
              name
            }
          }
        }
      }
    }
  }
`;
