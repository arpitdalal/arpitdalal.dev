import { useEventListener, useWindowSize } from '@reactuses/core'
import { motion, transform, useScroll, useTransform } from 'motion/react'
import { useRef, useState } from 'react'
import { ExternalLink } from '#app/components/external-link'
import { HighlightUnderline } from '#app/components/highlight'
import { Badge } from '#app/components/ui/badge'
import { type WorkExperience } from '#app/routes/_marketing+/__data'
import { useHints } from '#app/utils/client-hints'
import { cn } from '#app/utils/misc'
import { useFormatDistance } from '#app/utils/use-format-distance'
import {
	HEADING_STYLES,
	HEADING_STYLES_NO_JS_OR_MOTION_SAFE,
} from './animated-heading-styles'
import { LineGlow } from './line-glow'

const DIV_STYLES = {
	HEIGHT_START: '0px',
	HEIGHT_END: '100%',
}

export function WorkExperience({
	workExperience,
	jsEnabled,
}: {
	workExperience: WorkExperience[]
	jsEnabled: boolean
}) {
	const sectionRef = useRef<HTMLElement>(null)
	const olRef = useRef<HTMLOListElement>(null)
	const { width } = useWindowSize()
	const isXSScreen = width < 420
	const { scrollYProgress: scrollYProgressOfSection } = useScroll({
		target: sectionRef,
		offset: ['start start', '80px start'],
	})
	const { scrollYProgress: scrollYProgressOfOl } = useScroll({
		target: olRef,
		offset: ['start center', 'end center'],
	})
	const { reducedMotion } = useHints()
	const isReducedMotion = reducedMotion === 'reduce'

	const h2Left = useTransform(() => {
		if (isReducedMotion || !jsEnabled) return HEADING_STYLES.LEFT_START

		return transform(
			scrollYProgressOfSection.get(),
			[0, 1],
			[
				HEADING_STYLES.LEFT_START,
				isXSScreen
					? HEADING_STYLES.LEFT_END_SMALL_SCREEN
					: HEADING_STYLES.LEFT_END,
			],
		)
	})
	const divHeight = useTransform(() => {
		if (isReducedMotion || !jsEnabled) return DIV_STYLES.HEIGHT_START

		return transform(
			scrollYProgressOfOl.get(),
			[0, 1],
			[DIV_STYLES.HEIGHT_START, DIV_STYLES.HEIGHT_END],
		)
	})

	return (
		<section ref={sectionRef} id="work">
			<LineGlow />
			<div className="container pb-12">
				<motion.h2
					style={{
						paddingLeft: h2Left,
					}}
					className={cn(
						'xs:top-14 sticky top-12 z-40 max-w-fit sm:top-12',
						(!jsEnabled || isReducedMotion) &&
							HEADING_STYLES_NO_JS_OR_MOTION_SAFE,
					)}
				>
					<HighlightUnderline>Work Experience</HighlightUnderline>
				</motion.h2>
				<ol ref={olRef} className="group/ol relative mt-8">
					{/* Background Timeline */}
					<div className="absolute inset-0 grid grid-cols-8" aria-hidden>
						<div className="col-span-2 max-sm:border-l-2 sm:border-r-2" />
					</div>
					{/* Active Timeline */}
					<motion.div
						className="absolute inset-0 grid grid-cols-8"
						style={{
							height: divHeight,
						}}
						aria-hidden
					>
						<div className="border-primary pointer-events-none z-10 col-span-2 max-sm:border-l-2 sm:border-r-2" />
					</motion.div>
					{workExperience.map((props) => (
						<WorkExperienceCard key={props.title} {...props} />
					))}
				</ol>
			</div>
		</section>
	)
}

export function WorkExperienceCard({
	title,
	link,
	company,
	location,
	description,
	startDate,
	endDate,
	tags,
}: WorkExperience) {
	const articleRef = useRef<HTMLElement>(null)
	const { reducedMotion } = useHints()
	const isReducedMotion = reducedMotion === 'reduce'
	const { width } = useWindowSize()
	const isMdScreen = width < 1024
	const formatDistance = useFormatDistance(startDate, endDate)

	const [offsetX, setOffsetX] = useState(0)
	const [offsetY, setOffsetY] = useState(0)

	useEventListener(
		'mousemove',
		(event: MouseEvent) => {
			if (isMdScreen) return
			if (!articleRef.current || isReducedMotion) return

			const hoverBg = articleRef.current
			const centerX = hoverBg.offsetWidth / 2
			const centerY = hoverBg.offsetHeight / 2

			setOffsetX(event.offsetX - centerX)
			setOffsetY(event.offsetY - centerY)
		},
		articleRef,
	)

	return (
		<li>
			<article
				ref={articleRef}
				className="group relative grid py-8 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:group-hover/ol:opacity-50 lg:hover:opacity-100!"
			>
				{/* Hover background */}
				<div
					style={{
						'--motion-factor': isReducedMotion ? 0 : 0.05,
						'--x-motion': `${offsetX}px`,
						'--y-motion': `${offsetY}px`,
						transform: `translate(calc(var(--x-motion) * var(--motion-factor) * -1),calc(var(--y-motion) * var(--motion-factor) * -1))`,
						transitionTimingFunction: 'var(--in-out-quad)',
					}}
					className="motion-safe:lg:group-hover:bg-accent/60 absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block motion-safe:lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] motion-safe:lg:group-hover:drop-shadow-lg"
					aria-hidden
				/>
				{/* Timeline */}
				<div className="absolute inset-0 grid grid-cols-8" aria-hidden>
					<div className="col-span-2">
						<div className="relative">
							{/* Bigger circle for the background */}
							<div className="bg-background absolute top-[38px] z-20 size-5 rounded-full max-sm:-left-[9px] sm:-right-[9px]" />
							{/* Timeline circle */}
							<div className="bg-primary absolute top-10 z-20 size-4 rounded-full max-sm:-left-[7px] sm:-right-[7px]" />
						</div>
					</div>
				</div>
				<header
					className="text-foreground/70 z-10 mt-1 mb-2 font-semibold tracking-wide uppercase max-sm:pl-5 sm:col-span-2 sm:pr-3 sm:text-right"
					aria-label={`${startDate} ${endDate.toLowerCase() === 'present' ? 'till' : 'to'} ${endDate}`}
				>
					<time>
						{startDate} - {endDate} · {formatDistance}
					</time>
				</header>
				<div className="z-10 pl-5 sm:col-span-6 sm:pl-3">
					<h3 className="font-medium">
						<ExternalLink
							href={link}
							className="hover:text-primary focus-visible:text-primary text-foreground items-baseline leading-tight font-medium"
							aria-label={`${title} at ${company} (opens in a new tab)`}
							applyUnderlineClassName={false}
						>
							{/* This is for making the link clickable on the whole card */}
							<span
								className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"
								aria-hidden
							></span>
							<span>
								{title} · {company}
							</span>
						</ExternalLink>
					</h3>
					<p className="text-foreground/70 mt-1">{location}</p>
					<p className="text-foreground/70 mt-2 leading-normal">
						{description}
					</p>
					<ul className="mt-4 flex flex-wrap gap-2" aria-label="Tags">
						{tags.map((tag) => (
							<Badge key={tag}>{tag}</Badge>
						))}
					</ul>
				</div>
			</article>
		</li>
	)
}
