import ExternalLink from '#app/components/external-link.js'
import { Badge } from '#app/components/ui/badge.js'
import { Icon } from '#app/components/ui/icon.js'

export type WorkExperienceCardProps = {
	title: string
	previousTitles?: string[]
	link: string
	company: string
	location: string
	description: string
	startDate: string
	endDate: string
	technologies: string[]
}
export function WorkExperienceCard({
	title,
	previousTitles,
	link,
	company,
	location,
	description,
	startDate,
	endDate,
	technologies,
}: WorkExperienceCardProps) {
	return (
		<li>
			<article className="group relative grid py-8 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/ol:opacity-50">
				<div
					className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-accent/60 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"
					aria-hidden
				/>
				<div
					className="absolute inset-0 mr-4 hidden grid-cols-8 sm:grid"
					aria-hidden
				>
					<div className="col-span-2 border-r-2" />
					<div className="relative">
						<div className="absolute -left-[9px] top-10 size-4 rounded-full bg-primary" />
					</div>
				</div>
				<header
					className="z-10 mb-2 mt-1 font-semibold uppercase tracking-wide text-foreground/70 sm:col-span-2 sm:pr-3 sm:text-right"
					aria-label={`${startDate} ${endDate.toLowerCase() === 'present' ? 'till' : 'to'} ${endDate}`}
				>
					<time>
						{startDate} - {endDate}
					</time>
				</header>
				<div className="z-10 sm:col-span-6 sm:pl-3">
					<h3 className="font-medium">
						<ExternalLink
							href={link}
							className="group/link inline-flex items-baseline font-medium leading-tight"
							aria-label={`${title} at ${company} (opens in a new tab)`}
						>
							<span
								className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"
								aria-hidden
							></span>
							<span>
								{title} ·{' '}
								<span className="inline-block">
									{company}
									<Icon
										name="arrow-up-right-outline"
										className="ml-1 translate-y-px transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1 group-focus-visible/link:-translate-y-1 group-focus-visible/link:translate-x-1 motion-reduce:transition-none"
										aria-hidden
									/>
								</span>
							</span>
						</ExternalLink>
					</h3>
					{previousTitles && previousTitles.length > 0 && (
						<ol aria-label="Previous titles">
							{previousTitles.map(previousTitle => (
								<li key={previousTitle} className="text-sm text-foreground/90">
									<Icon
										name="arrow-up-outline"
										arial-label={`Previous title: ${previousTitle}`}
									>
										{previousTitle}
									</Icon>
								</li>
							))}
						</ol>
					)}
					<p className="mt-1 text-foreground/70">{location}</p>
					<p className="mt-2 leading-normal">{description}</p>
					<ul
						className="mt-4 flex flex-wrap space-x-2"
						aria-label="Technologies used"
					>
						{technologies.map(technology => (
							<Badge key={technology}>{technology}</Badge>
						))}
					</ul>
				</div>
			</article>
		</li>
	)
}