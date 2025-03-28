export const GET_BLOG_POSTS = `
  query GetBlogPosts {
    publication(host: "${process.env.HASHNODE_PUBLICATION_HOST}") {
      posts(first: 2) {
        edges {
          node {
            id
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
`

export const ADD_SUBSCRIBER = `
  mutation SubscribeToNewsletter($input: SubscribeToNewsletterInput!) {
    subscribeToNewsletter(input: $input) {
      status
    }
  }
`
