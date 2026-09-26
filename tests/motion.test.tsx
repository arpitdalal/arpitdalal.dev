import { render, screen, waitFor } from '@testing-library/react'
import {
	AnimatePresence,
	motion,
	useMotionTemplate,
	useMotionValue,
	useScroll,
	useTransform,
} from 'motion/react'
import { useRef } from 'react'
import { describe, expect, it } from 'vitest'
import {
	HEADING_STYLES,
	headingOffsetFor,
} from '#app/components/animated-heading-styles'

/**
 * motion 13 dropped @emotion/is-prop-valid as an optional dependency in
 * favour of explicit injection, which is the only React-facing breaking
 * change in the major. That affects styled-components and Emotion, neither
 * of which this repo uses, so the migration risk here is behavioural rather
 * than API-shaped — which is exactly the kind of thing a type check will
 * not catch. These tests pin the runtime behaviour instead.
 */

const nextFrame = () =>
	new Promise<void>((resolve) => {
		requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
	})

describe('motion runtime', () => {
	it('applies initial then settles on the animate value', async () => {
		render(
			<motion.div
				data-testid="target"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0 }}
			/>,
		)

		const el = screen.getByTestId('target')
		await waitFor(() => expect(el).toHaveStyle({ opacity: '1' }))
	})

	it('honours a transform in the animate target', async () => {
		render(
			<motion.div
				data-testid="scaled"
				initial={{ scale: 0.5 }}
				animate={{ scale: 1 }}
				transition={{ duration: 0 }}
			/>,
		)

		await waitFor(() =>
			expect(screen.getByTestId('scaled')).toHaveStyle({ transform: 'none' }),
		)
	})

	it('renders and removes children through AnimatePresence', async () => {
		const { rerender } = render(
			<AnimatePresence>
				<motion.div key="present" data-testid="panel">
					panel
				</motion.div>
			</AnimatePresence>,
		)

		expect(screen.getByTestId('panel')).toBeInTheDocument()

		rerender(<AnimatePresence />)
		await waitFor(() => expect(screen.queryByTestId('panel')).toBeNull())
	})

	it('renders motion.svg elements', () => {
		render(
			<svg data-testid="svg">
				<motion.rect
					data-testid="rect"
					width={10}
					height={10}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0 }}
				/>
			</svg>,
		)

		expect(screen.getByTestId('rect')).toBeInTheDocument()
	})
})

/**
 * The scroll-linked heading offset in section.tsx and work-experience.tsx is
 * built from `transform` inside a `useTransform` subscription. It is pure
 * arithmetic over a progress value, so it is worth asserting directly: a
 * change to the input or output range signature would otherwise only show up
 * as a heading that drifts out of place on a real scroll.
 */
describe('scroll-linked heading offset', () => {
	// Exercises the real shared helper rather than a copy, so changing the
	// input or output range in animated-heading-styles.ts is caught here.
	const offsetFor = (progress: number, isXSScreen = false) =>
		headingOffsetFor(progress, isXSScreen)

	it('returns the start offset at zero progress', () => {
		expect(offsetFor(0)).toBe(HEADING_STYLES.LEFT_START)
	})

	it('returns the end offset at full progress', () => {
		expect(offsetFor(1)).toBe(HEADING_STYLES.LEFT_END)
	})

	it('interpolates between the two bounds', () => {
		expect(offsetFor(0.5)).toBe('46px')
	})

	it('clamps past the end of the range', () => {
		expect(offsetFor(2)).toBe(HEADING_STYLES.LEFT_END)
		expect(offsetFor(-1)).toBe(HEADING_STYLES.LEFT_START)
	})

	it('uses the narrower end offset on small screens', () => {
		expect(offsetFor(1, true)).toBe(HEADING_STYLES.LEFT_END_SMALL_SCREEN)
		expect(HEADING_STYLES.LEFT_END_SMALL_SCREEN).not.toBe(
			HEADING_STYLES.LEFT_END,
		)
	})

	it('drives a motion style through a useTransform subscription', async () => {
		function Heading() {
			const progress = useMotionValue(0)
			const left = useTransform(() => headingOffsetFor(progress.get()))

			return (
				<motion.h2
					data-testid="heading"
					style={{ paddingLeft: left }}
					initial={{ opacity: 1 }}
					animate={{ opacity: 1 }}
				>
					heading
				</motion.h2>
			)
		}

		render(<Heading />)
		await nextFrame()

		expect(screen.getByTestId('heading')).toHaveStyle({
			paddingLeft: HEADING_STYLES.LEFT_START,
		})
	})
})

describe('useMotionTemplate', () => {
	it('interpolates a template from a subscribed motion value', async () => {
		function Template() {
			const width = useMotionValue(10)
			const boxShadow = useMotionTemplate`0 0 ${width}px rgba(0,0,0,0.5)`

			return (
				<motion.div
					data-testid="templated"
					style={{ boxShadow }}
					initial={{ opacity: 1 }}
					animate={{ opacity: 1 }}
				/>
			)
		}

		render(<Template />)
		await nextFrame()

		expect(screen.getByTestId('templated')).toHaveStyle({
			boxShadow: '0 0 10px rgba(0,0,0,0.5)',
		})
	})
})

/**
 * Mirrors the useScroll({ target, offset }) shape used by section.tsx. jsdom
 * does not implement layout, so this asserts that the ref-target form mounts
 * and renders without throwing rather than asserting scroll behaviour.
 */
describe('useScroll with a ref target', () => {
	it('mounts without throwing when given a target ref', async () => {
		function ScrollSection() {
			const ref = useRef<HTMLDivElement>(null)
			const { scrollYProgress } = useScroll({
				target: ref,
				offset: ['start start', '80px start'],
			})
			const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.5])

			return (
				<motion.div
					ref={ref}
					data-testid="scroll-section"
					style={{ opacity }}
					initial={{ opacity: 1 }}
					animate={{ opacity: 1 }}
				>
					content
				</motion.div>
			)
		}

		render(<ScrollSection />)
		await nextFrame()

		expect(screen.getByTestId('scroll-section')).toBeInTheDocument()
	})
})
