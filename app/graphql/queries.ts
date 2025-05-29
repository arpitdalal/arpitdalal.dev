export const GET_BLOG_POSTS = `
  query GetBlogPosts {
    publication(host: "${process.env.HASHNODE_PUBLICATION_HOST}") {
      posts(first: 6) {
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
            series {
              slug
            }
          }
        }
      }
    }
  }
`

export const GET_NOTES = `
  query GetNotes {
    publication(host: "${process.env.HASHNODE_PUBLICATION_HOST}") {
      series(slug: "notes") {
        posts (first: 2) {
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
                id
                name
              }
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
