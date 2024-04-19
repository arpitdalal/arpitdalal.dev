import { useMeasure, useWindowSize } from '@reactuses/core'
import { Link, NavLink } from '@remix-run/react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import BlogLink from '#app/components/blog-link.tsx'
import {
	Logo,
	LogoCircle,
	LogoImage,
	LogoSpinner,
} from '#app/components/logo.tsx'
import { headerAndFooterCommonLinks } from '#app/root.tsx'
import { useHints } from '#app/utils/client-hints.tsx'
import { capitalize } from '#app/utils/misc.tsx'

const HEADER_PADDING_INLINE_START = '0'
const HEADER_PADDING_INLINE_END = '2rem'
const HEADER_TOP_START = '0'
const HEADER_TOP_END = '1.25rem'
const DIV_MAX_WIDTH_START = 4000
const DIV_MAX_WIDTH_END = 1400
const DIV_BORDER_RADIUS_START = '0%'
const DIV_BORDER_RADIUS_END = '9999px'
const DIV_BORDER_WIDTH_START = '0px'
const DIV_BORDER_WIDTH_END = '1px'
const NAV_PADDING_START = '0 2rem'
const NAV_PADDING_END = '0 1rem'
const TEXT_OPACITY_START = 1
const TEXT_OPACITY_END = 0
const TEXT_X_START = 0
const TEXT_X_END = 192

export function Header({
	spanRef,
	spanWidth,
	windowWidth = DIV_MAX_WIDTH_START,
}: {
	spanRef?: React.RefObject<HTMLSpanElement>
	spanWidth?: number
	windowWidth?: number
}) {
	const { reducedMotion } = useHints()
	const isReducedMotion = reducedMotion === 'reduce'

	const { scrollYProgress } = useScroll()

	const headerPaddingInline = useTransform(
		scrollYProgress,
		[0, 0.1],
		[
			HEADER_PADDING_INLINE_START,
			isReducedMotion ? HEADER_PADDING_INLINE_START : HEADER_PADDING_INLINE_END,
		],
	)
	const headerTop = useTransform(
		scrollYProgress,
		[0, 0.1],
		[HEADER_TOP_START, isReducedMotion ? HEADER_TOP_START : HEADER_TOP_END],
	)
	const divMaxWidth = useTransform(
		scrollYProgress,
		[0, 0.1],
		[windowWidth, isReducedMotion ? windowWidth : DIV_MAX_WIDTH_END],
	)
	const divBorderRadius = useTransform(
		scrollYProgress,
		[0, 0.1],
		[
			DIV_BORDER_RADIUS_START,
			isReducedMotion ? DIV_BORDER_RADIUS_START : DIV_BORDER_RADIUS_END,
		],
	)
	const divBorderWidth = useTransform(
		scrollYProgress,
		[0, 0.1],
		[
			DIV_BORDER_WIDTH_START,
			isReducedMotion ? DIV_BORDER_WIDTH_START : DIV_BORDER_WIDTH_END,
		],
	)
	const navPadding = useTransform(
		scrollYProgress,
		[0, 0.1],
		[NAV_PADDING_START, isReducedMotion ? NAV_PADDING_START : NAV_PADDING_END],
	)
	const textOpacity = useTransform(
		scrollYProgress,
		[0, 0.1],
		[
			TEXT_OPACITY_START,
			isReducedMotion ? TEXT_OPACITY_START : TEXT_OPACITY_END,
		],
	)
	const textX = useTransform(
		scrollYProgress,
		[0, 0.1],
		[TEXT_X_START, isReducedMotion ? TEXT_X_START : -(spanWidth ?? TEXT_X_END)],
	)

	return (
		<motion.header
			className="fixed left-0 right-0 z-50 mx-auto w-full"
			style={{
				paddingInline: headerPaddingInline,
				top: headerTop,
			}}
		>
			<motion.div
				className="mx-auto bg-accent/60 py-4 backdrop-blur-md"
				style={{
					borderRadius: divBorderRadius,
					maxWidth: divMaxWidth,
					borderWidth: divBorderWidth,
					borderStyle: 'solid',
					borderColor: 'hsl(var(--foreground) / 0.4)',
				}}
			>
				<motion.nav
					className="container flex items-center justify-between gap-4 md:gap-8"
					style={{
						padding: navPadding,
					}}
				>
					<a
						className="absolute -top-96 left-0 z-50 m-3 bg-primary p-3 opacity-0 transition-opacity duration-200 ease-in-out focus:top-0 focus:opacity-100"
						// eslint-disable-next-line remix-react-routes/use-link-for-routes -- Needed because Link doesn't work here
						href="#main"
					>
						Skip Navigation
					</a>
					<Link
						to="/"
						className="group z-10 flex items-center gap-4 overflow-clip"
					>
						<Logo className="z-10">
							<LogoCircle />
							<LogoSpinner />
							<LogoImage />
						</Logo>
						<motion.span
							className="underlined text-h2"
							style={{
								opacity: textOpacity,
								x: textX,
							}}
							ref={spanRef}
						>
							Arpit Dalal
						</motion.span>
					</Link>
					<ul className="flex items-center gap-4 md:gap-8">
						<li>
							<BlogLink />
						</li>
						{Object.entries(headerAndFooterCommonLinks).map(([key, value]) => (
							<li key={key}>
								<NavLink to={value} className="underlined text-foreground/70">
									{capitalize(key)}
								</NavLink>
							</li>
						))}
					</ul>
				</motion.nav>
			</motion.div>
		</motion.header>
	)
}

export function HeaderInBrowser() {
	const { width } = useWindowSize()
	const spanRef = useRef<HTMLSpanElement>(null)
	const [rect] = useMeasure(spanRef)

	return <Header spanRef={spanRef} spanWidth={rect.width} windowWidth={width} />
}
