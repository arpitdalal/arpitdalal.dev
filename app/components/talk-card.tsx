import {
	Card,
	CardContent,
	CardDescription,
	CardTags,
	CardTitle,
} from '#app/components/card'
import { ExternalLink } from '#app/components/external-link'
import { type Talk } from '#app/routes/_marketing+/__data'

export function TalkCard({
	talk,
}: {
	talk: Talk & { formattedDate: string }
}) {
	return (
		<Card
			id={talk.slug}
			tabIndex={-1}
			className="scroll-mt-28 outline-none target:ring-primary target:ring-offset-background rounded-md target:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.15)] target:ring-2 target:ring-offset-2 focus-visible:ring-primary focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2"
		>
			<CardContent>
				<CardTitle title={talk.title} />
				<CardDescription className="mt-1 text-sm">
					<time dateTime={talk.date}>{talk.formattedDate}</time>
					{talk.venue ? (
						<>
							{' '}
							<span aria-hidden>·</span> {talk.venue}
						</>
					) : null}
				</CardDescription>
				<CardDescription>{talk.description}</CardDescription>
				<CardTags tags={talk.tags} />
				{talk.links.length > 0 ? (
					<ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-label="Links">
						{talk.links.map((link) => (
							<li key={`${link.label}-${link.href}`}>
								<ExternalLink
									href={link.href}
									aria-label={`${link.label} (opens in a new tab)`}
									applyUnderlineClassName={false}
								>
									{link.label}
								</ExternalLink>
							</li>
						))}
					</ul>
				) : null}
			</CardContent>
		</Card>
	)
}
