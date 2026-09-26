import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { TalkCard } from '#app/components/talk-card'
import { type Talk } from '#app/routes/_marketing+/__data'

/**
 * These render through jsdom on purpose. jsdom 30 and its @asamuzakjp/*,
 * w3c-xmlserializer and whatwg-url dependencies arrived with a four-major
 * jump, and until something actually mounted a DOM none of that was
 * exercised. A component test is the cheapest thing that closes that gap.
 */
afterEach(cleanup)

const baseTalk: Talk & { formattedDate: string } = {
	slug: 'satsang-2025',
	title: 'Building a Personal Site That Lasts',
	description: 'A talk about durable personal sites.',
	date: '2025-03-14',
	formattedDate: 'March 14, 2025',
	tags: ['Web', 'DX'],
	links: [{ label: 'Slides', href: 'https://example.com/slides' }],
}

// Card renders an <li>, so TalkCard has to be mounted inside a list.
const renderTalk = (talk: Talk & { formattedDate: string }) =>
	render(
		<ul>
			<TalkCard talk={talk} />
		</ul>,
	)

describe('TalkCard', () => {
	it('renders the title, description and formatted date', () => {
		renderTalk(baseTalk)

		expect(
			screen.getByRole('heading', { name: baseTalk.title }),
		).toBeInTheDocument()
		expect(screen.getByText(baseTalk.description)).toBeInTheDocument()
		expect(screen.getByText('March 14, 2025')).toBeInTheDocument()
	})

	it('exposes the raw ISO date on the time element', () => {
		renderTalk(baseTalk)

		// The machine-readable value must stay ISO even though the visible
		// text is human formatted.
		expect(screen.getByText('March 14, 2025')).toHaveAttribute(
			'dateTime',
			'2025-03-14',
		)
	})

	it('uses the slug as the card id so it can be linked to', () => {
		const { container } = renderTalk(baseTalk)

		const card = container.querySelector('li')
		expect(card).toHaveAttribute('id', baseTalk.slug)
	})

	it('shows the venue alongside a separator dot', () => {
		const { container } = renderTalk({ ...baseTalk, venue: 'JSConf EU' })

		const venueLine = screen.getByText('March 14, 2025').parentElement
		expect(venueLine?.textContent).toContain('JSConf EU')
		expect(venueLine?.querySelector('[aria-hidden]')?.textContent).toBe('·')
		expect(container.querySelector('li')).toBeInTheDocument()
	})

	it('omits the venue separator when there is no venue', () => {
		renderTalk(baseTalk)

		// Scope to the venue line. Card itself renders an aria-hidden
		// background div, so a bare [aria-hidden] query is not specific.
		const venueLine = screen.getByText('March 14, 2025').parentElement
		expect(venueLine?.querySelector('[aria-hidden]')).toBeNull()
		expect(venueLine?.textContent).toBe('March 14, 2025')
	})

	it('renders every talk tag', () => {
		renderTalk(baseTalk)

		for (const tag of baseTalk.tags) {
			expect(screen.getByText(tag)).toBeInTheDocument()
		}
	})

	it('links each talk link with a new-tab accessible name', () => {
		renderTalk(baseTalk)

		const links = within(
			screen.getByRole('list', { name: 'Links' }),
		).getAllByRole('link')
		expect(links).toHaveLength(1)
		expect(links[0]).toHaveAttribute('href', 'https://example.com/slides')
		expect(links[0]).toHaveAttribute(
			'aria-label',
			'Slides (opens in a new tab)',
		)
		expect(links[0]).toHaveAttribute('target', '_blank')
		expect(links[0]).toHaveAttribute('rel', 'noreferrer')
	})

	it('renders several links when a talk has them', () => {
		renderTalk({
			...baseTalk,
			links: [
				{ label: 'Slides', href: 'https://example.com/slides' },
				{ label: 'Video', href: 'https://example.com/video' },
			],
		})

		const links = within(
			screen.getByRole('list', { name: 'Links' }),
		).getAllByRole('link')
		expect(links.map((link) => link.getAttribute('href'))).toEqual([
			'https://example.com/slides',
			'https://example.com/video',
		])
	})

	it('omits the links list entirely when a talk has no links', () => {
		renderTalk({ ...baseTalk, links: [] })

		expect(screen.queryByRole('list', { name: 'Links' })).toBeNull()
	})

	it('keeps every scroll-target and focus-ring utility on the card', () => {
		const { container } = renderTalk(baseTalk)
		const classes = container.querySelector('li')?.className.split(/\s+/) ?? []

		// prettier-plugin-tailwindcss rewrites this className on every plugin
		// bump, and a comma inside the arbitrary shadow value has made the
		// sort unstable across versions. Class order does not affect the
		// cascade, so assert the set rather than the sequence, but do assert
		// presence: losing target:ring-* would silently drop the highlight
		// that marks the linked card on the talks page.
		for (const utility of [
			'target:ring-primary',
			'target:ring-offset-background',
			'target:ring-2',
			'target:ring-offset-2',
			'target:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.15)]',
			'focus-visible:ring-primary',
			'focus-visible:ring-2',
			'focus-visible:ring-offset-2',
			'scroll-mt-28',
			'rounded-md',
			'outline-none',
		]) {
			expect(classes).toContain(utility)
		}
	})

	it('keeps the card out of the tab order but still focusable programmatically', () => {
		const { container } = renderTalk(baseTalk)

		// tabIndex={-1} is deliberate: the card is a scroll target for
		// incoming #hash links, not a keyboard stop.
		expect(container.querySelector('li')).toHaveAttribute('tabindex', '-1')
	})
})
