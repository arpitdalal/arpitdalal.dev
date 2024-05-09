import { useWindowSize } from '@reactuses/core'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import ExternalLink from '#app/components/external-link'
import { HighlightUnderline } from '#app/components/highlight'
import { Badge } from '#app/components/ui/badge'
import { Icon } from '#app/components/ui/icon'
import { useHints } from '#app/utils/client-hints.js'

const H2_STYLES = {
	LEFT_START: '0px',
	LEFT_END: '92px',
	LEFT_END_SMALL_SCREEN: '78px',
}
export function WorkExperience({
	workExperience,
}: {
	workExperience: WorkExperienceCardProps[]
}) {
	const sectionRef = useRef<HTMLElement>(null)
	const h2Ref = useRef<HTMLHeadingElement>(null)
	const { width } = useWindowSize()
	const isXSScreen = width < 420
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ['start start', '80px start'],
	})
	const { reducedMotion } = useHints()
	const isReducedMotion = reducedMotion === 'reduce'

	const h2Left = useTransform(
		scrollYProgress,
		[0, 1],
		[
			H2_STYLES.LEFT_START,
			isReducedMotion
				? H2_STYLES.LEFT_START
				: isXSScreen
					? H2_STYLES.LEFT_END_SMALL_SCREEN
					: H2_STYLES.LEFT_END,
		],
	)

	return (
		<section
			ref={sectionRef}
			className="container scroll-mt-16 pb-12 pt-32 lg:scroll-mt-24"
			id="work"
		>
			<motion.h2
				ref={h2Ref}
				style={{
					paddingLeft: h2Left,
				}}
				className="xs:top-14 sticky top-12 z-40 max-w-fit sm:top-12"
			>
				<HighlightUnderline>Work Experience</HighlightUnderline>
			</motion.h2>
			<ol className="group/ol mt-8">
				{workExperience.map(props => (
					<WorkExperienceCard key={props.title} {...props} />
				))}
			</ol>
		</section>
	)
}

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
				{/* Hover background */}
				<div
					className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-accent/60 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"
					aria-hidden
				/>
				{/* Timeline */}
				<div className="absolute inset-0 mr-4 grid grid-cols-8" aria-hidden>
					<div className="col-span-2 max-sm:border-l-2 sm:border-r-2">
						<div className="relative">
							{/* Bigger circle for the background */}
							<div className="absolute top-[38px] size-5 rounded-full bg-background max-sm:-left-[11px] sm:-right-[11px] lg:group-hover:bg-accent/60" />
							{/* Timeline circle */}
							<div className="absolute top-10 size-4 rounded-full bg-primary max-sm:-left-[9px] sm:-right-[9px]" />
						</div>
					</div>
				</div>
				<header
					className="z-10 mb-2 mt-1 font-semibold uppercase tracking-wide text-foreground/70 max-sm:pl-5 sm:col-span-2 sm:pr-3 sm:text-right"
					aria-label={`${startDate} ${endDate.toLowerCase() === 'present' ? 'till' : 'to'} ${endDate}`}
				>
					<time>
						{startDate} - {endDate}
					</time>
				</header>
				<div className="z-10 pl-5 sm:col-span-6 sm:pl-3">
					<h3 className="font-medium">
						<ExternalLink
							href={link}
							className="group/link inline-flex items-baseline font-medium leading-tight hover:text-primary focus-visible:text-primary"
							aria-label={`${title} at ${company} (opens in a new tab)`}
						>
							{/* This is for making the link clickable on the whole card */}
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
						className="mt-4 flex flex-wrap gap-2"
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
