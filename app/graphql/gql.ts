import { tryCatch } from '#app/utils/misc'

export function gql(query: string) {
	return tryCatch(
		fetch('https://gql.hashnode.com', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ query }),
		}),
	)
}
