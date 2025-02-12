import { ExternalLink } from './external-link'
import { Badge } from './ui/badge'

export type CardProps = {
	title: string
	link: string
	imageUrl: string
	imageAlt: string
	description: string
	tags?: string[]
}

export function Card({
	title,
	link,
	imageUrl,
	imageAlt,
	description,
	tags,
}: CardProps) {
	return (
		<li>
			<article className="group relative grid py-8 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:group-hover/ol:opacity-50 lg:hover:opacity-100!">
				<div
					className="motion-safe:lg:group-hover:bg-accent/60 absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block motion-safe:lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] motion-safe:lg:group-hover:drop-shadow-lg"
					aria-hidden
				/>
				<div className="text-foreground/70 z-10 mt-1 mb-2 font-semibold tracking-wide uppercase sm:col-span-2 sm:pr-3 sm:text-right">
					<img
						src={imageUrl}
						alt={imageAlt}
						className="w-full drop-shadow-2xl"
					/>
				</div>
				<div className="z-10 max-sm:mt-4 sm:col-span-6">
					<h3 className="font-medium">
						<ExternalLink
							href={link}
							className="hover:text-primary focus-visible:text-primary items-baseline leading-tight font-medium"
							aria-label={`${title} (opens in a new tab)`}
						>
							{/* This is for making the link clickable on the whole card */}
							<span
								className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"
								aria-hidden
							></span>
							<span>{title}</span>
						</ExternalLink>
					</h3>
					<p className="mt-2 leading-normal">{description}</p>
					{tags && tags.length > 0 ? (
						<ul className="mt-4 flex flex-wrap gap-2" aria-label="Tags">
							{tags.map((tag) => (
								<Badge key={tag}>{tag}</Badge>
							))}
						</ul>
					) : null}
				</div>
			</article>
		</li>
	)
}
