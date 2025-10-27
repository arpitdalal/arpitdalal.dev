import { parseWithZod } from '@conform-to/zod/v4'
import { ADD_SUBSCRIBER } from '#app/graphql/queries'
import { checkHoneypot } from '#app/utils/honeypot.server'
import { NewsletterSchema, SubscribeResponseSchema } from '#app/utils/schemas'
import { type Route } from './+types/newsletter'

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData()
	await checkHoneypot(formData)
	const submission = parseWithZod(formData, { schema: NewsletterSchema })

	if (submission.status !== 'success') {
		return { result: submission.reply(), success: false }
	}

	try {
		await subscribeToNewsletter(
			submission.value.newsletterEmail,
			process.env.HASHNODE_PUBLICATION_ID,
		)
		return {
			result: submission.reply({ resetForm: true }),
			success: true,
		}
	} catch (error) {
		console.error('Error subscribing to newsletter', error)
		return {
			result: submission.reply({
				formErrors: [
					'Error subscribing to newsletter. Please try again later.',
				],
			}),
			success: false,
		}
	}
}

async function subscribeToNewsletter(email: string, publicationId: string) {
	const response = await fetch('https://gql.hashnode.com', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			query: ADD_SUBSCRIBER,
			variables: {
				input: {
					publicationId,
					email,
				},
			},
		}),
	})

	const rawResult = await response.json()
	const result = SubscribeResponseSchema.safeParse(rawResult)

	if (!result.success) {
		console.error('Invalid response from Hashnode:', result.error)
		throw new Error('Invalid response from newsletter service')
	}

	if (result.data.errors?.length) {
		throw new Error(result.data.errors[0]?.message || 'Unknown error')
	}

	if (!result.data.data?.subscribeToNewsletter.status) {
		throw new Error('Failed to subscribe to newsletter')
	}

	return result.data
}
