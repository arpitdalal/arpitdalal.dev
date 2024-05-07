import { useMeasure, useWindowSize } from '@reactuses/core'
import { Link, NavLink } from '@remix-run/react'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import ExternalLink from '#app/components/external-link.tsx'
import {
	Logo,
	LogoCircle,
	LogoImage,
	LogoSpinner,
} from '#app/components/logo.tsx'
import { headerAndFooterCommonLinks } from '#app/root.tsx'
import { useHints } from '#app/utils/client-hints.tsx'
import { capitalize, cn } from '#app/utils/misc.tsx'

const HEADER_STYLES = {
	PADDING_INLINE_START: '0',
	PADDING_INLINE_END: '2rem',
	TOP_START: '0',
	TOP_END: '1.25rem',
}

const DIV_STYLES = {
	MAX_WIDTH_START: 4000,
	MAX_WIDTH_END: 1400,
	BORDER_RADIUS_START: '0%',
	BORDER_RADIUS_END: '3rem',
	BORDER_WIDTH_START: '0px',
	BORDER_WIDTH_END: '1px',
}

const NAV_STYLES = {
	PADDING_START: '0 2rem',
	PADDING_END: '0 1rem',
}

const TEXT_STYLES = {
	OPACITY_START: 1,
	OPACITY_END: 0,
	X_START: 0,
	X_END: 192,
}

const mobileButtonVariants = {
	topLine: {
		open: { rotate: 45, y: 7, originX: '16px', originY: '10px' },
		closed: { rotate: 0, y: 0, originX: 0, originY: 0 },
	},
	centerLine: {
		open: { opacity: 0 },
		closed: { opacity: 1 },
	},
	bottomLine: {
		open: { rotate: -45, y: -5, originX: '16px', originY: '22px' },
		closed: { rotate: 0, y: 0, originX: 0, originY: 0 },
	},
}

export function Header({
	spanRef,
	spanWidth,
	windowWidth = DIV_STYLES.MAX_WIDTH_START,
}: {
	spanRef?: React.RefObject<HTMLSpanElement>
	spanWidth?: number
	windowWidth?: number
}) {
	const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
	const { reducedMotion } = useHints()
	const isReducedMotion = reducedMotion === 'reduce'
	const transition = isReducedMotion ? { duration: 0 } : {}

	const { scrollYProgress } = useScroll()

	const headerPaddingInline = useTransform(
		scrollYProgress,
		[0, 0.1],
		[
			HEADER_STYLES.PADDING_INLINE_START,
			isReducedMotion
				? HEADER_STYLES.PADDING_INLINE_START
				: HEADER_STYLES.PADDING_INLINE_END,
		],
	)
	const headerTop = useTransform(
		scrollYProgress,
		[0, 0.1],
		[
			HEADER_STYLES.TOP_START,
			isReducedMotion ? HEADER_STYLES.TOP_START : HEADER_STYLES.TOP_END,
		],
	)
	const divMaxWidth = useTransform(
		scrollYProgress,
		[0, 0.1],
		[windowWidth, isReducedMotion ? windowWidth : DIV_STYLES.MAX_WIDTH_END],
	)
	const divBorderRadius = useTransform(
		scrollYProgress,
		[0, 0.1],
		[
			DIV_STYLES.BORDER_RADIUS_START,
			isReducedMotion
				? DIV_STYLES.BORDER_RADIUS_START
				: DIV_STYLES.BORDER_RADIUS_END,
		],
	)
	const divBorderWidth = useTransform(
		scrollYProgress,
		[0, 0.1],
		[
			DIV_STYLES.BORDER_WIDTH_START,
			isReducedMotion
				? DIV_STYLES.BORDER_WIDTH_START
				: DIV_STYLES.BORDER_WIDTH_END,
		],
	)
	const navPadding = useTransform(
		scrollYProgress,
		[0, 0.1],
		[
			NAV_STYLES.PADDING_START,
			isReducedMotion ? NAV_STYLES.PADDING_START : NAV_STYLES.PADDING_END,
		],
	)
	const textOpacity = useTransform(
		scrollYProgress,
		[0, 0.1],
		[
			TEXT_STYLES.OPACITY_START,
			isReducedMotion ? TEXT_STYLES.OPACITY_START : TEXT_STYLES.OPACITY_END,
		],
	)
	const textX = useTransform(
		scrollYProgress,
		[0, 0.1],
		[
			TEXT_STYLES.X_START,
			isReducedMotion ? TEXT_STYLES.X_START : -(spanWidth ?? TEXT_STYLES.X_END),
		],
	)

	const toggleMobileNav = () => {
		setIsMobileNavOpen(prevIsMobileNavOpen => !prevIsMobileNavOpen)
	}

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
					className="container"
					style={{
						padding: navPadding,
					}}
				>
					<div className="flex items-center justify-between gap-4 md:gap-8">
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
						<ul className="hidden items-center gap-4 md:flex md:gap-8">
							<li>
								<ExternalLink href="https://blog.arpitdalal.dev">
									Blog
								</ExternalLink>
							</li>
							{Object.entries(headerAndFooterCommonLinks).map(
								([key, value]) => (
									<li key={key}>
										<NavLink
											to={value}
											className="underlined text-foreground/70"
										>
											{capitalize(key)}
										</NavLink>
									</li>
								),
							)}
						</ul>
						<div className="md:hidden">
							<motion.button
								initial="hide"
								animate={isMobileNavOpen ? 'open' : 'closed'}
								onClick={toggleMobileNav}
								className="relative z-40 flex flex-col space-y-1"
							>
								<svg
									width="32"
									height="32"
									viewBox="0 0 32 32"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<motion.rect
										variants={mobileButtonVariants.topLine}
										transition={transition}
										x="6"
										y="9"
										width="20"
										height="2"
										rx="1"
										fill="currentColor"
									/>
									<motion.rect
										variants={mobileButtonVariants.centerLine}
										transition={transition}
										x="6"
										y="15"
										width="20"
										height="2"
										rx="1"
										fill="currentColor"
									/>
									<motion.rect
										variants={mobileButtonVariants.bottomLine}
										transition={transition}
										x="6"
										y="21"
										width="20"
										height="2"
										rx="1"
										fill="currentColor"
									/>
								</svg>
								<span className="sr-only">
									{isMobileNavOpen ? 'Close' : 'Open'} navbar
								</span>
							</motion.button>
						</div>
					</div>
					<AnimatePresence>
						{isMobileNavOpen && (
							<motion.ul
								className="flex flex-col divide-y divide-foreground/20 overflow-hidden md:hidden"
								initial={{ height: 0 }}
								animate={{ height: 'auto' }}
								exit={{ height: 0 }}
								transition={transition}
							>
								<li className="pt-4 last:pb-3">
									<ExternalLink
										href="https://blog.arpitdalal.dev"
										className="block w-full py-4 text-foreground/70 hover:text-foreground"
									>
										Blog
									</ExternalLink>
								</li>
								{Object.entries(headerAndFooterCommonLinks).map(
									([key, value]) => (
										<li key={key} className="last:pb-3">
											<NavLink
												to={value}
												className={({ isActive }) =>
													cn(
														`block w-full py-4 text-foreground/70 hover:text-foreground`,
														isActive && 'text-foreground',
													)
												}
											>
												{capitalize(key)}
											</NavLink>
										</li>
									),
								)}
							</motion.ul>
						)}
					</AnimatePresence>
				</motion.nav>
			</motion.div>
		</motion.header>
	)
}

export function ClientHeader() {
	const { width } = useWindowSize()
	const spanRef = useRef<HTMLSpanElement>(null)
	const [rect] = useMeasure(spanRef)

	return <Header spanRef={spanRef} spanWidth={rect.width} windowWidth={width} />
}
