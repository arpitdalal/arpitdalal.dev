import { useWindowSize } from '@reactuses/core'
import { motion, transform, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { HighlightUnderline } from '#app/components/highlight'
import { useHints } from '#app/utils/client-hints'
import { cn } from '#app/utils/misc'
import {
	HEADING_STYLES,
	HEADING_STYLES_NO_JS_OR_MOTION_SAFE,
} from './animated-heading-styles'
import { LineGlow } from './line-glow'

type SectionProps = {
	jsEnabled: boolean
	sectionTitle: string
	reduceOpacity?: boolean
} & React.HTMLAttributes<HTMLElement>

export function Section({
	jsEnabled,
	sectionTitle,
	children,
	reduceOpacity = true,
	...props
}: SectionProps) {
	const sectionRef = useRef<HTMLElement>(null)
	const { width } = useWindowSize()
	const isXSScreen = width < 420
	const { scrollYProgress: scrollYProgressOfSection } = useScroll({
		target: sectionRef,
		offset: ['start start', '80px start'],
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

	return (
		<section ref={sectionRef} {...props}>
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
					<HighlightUnderline>{sectionTitle}</HighlightUnderline>
				</motion.h2>
				<ol className={cn('relative mt-8', reduceOpacity && 'group/ol')}>
					{children}
				</ol>
			</div>
		</section>
	)
}
