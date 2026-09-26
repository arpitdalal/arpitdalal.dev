import { transform } from 'motion/react'

export const HEADING_STYLES = {
	LEFT_START: '0px',
	LEFT_END: '92px',
	LEFT_END_SMALL_SCREEN: '78px',
}
export const HEADING_STYLES_NO_JS_OR_MOTION_SAFE =
	'xs:top-24 static sm:top-24 pt-4 backdrop-blur-sm max-w-full'

/**
 * Maps a section's scroll progress onto the sticky heading's left padding.
 * Shared by section.tsx and work-experience.tsx, which both drift the heading
 * sideways as the section scrolls past.
 */
export function headingOffsetFor(progress: number, isXSScreen = false) {
	return transform(
		progress,
		[0, 1],
		[
			HEADING_STYLES.LEFT_START,
			isXSScreen
				? HEADING_STYLES.LEFT_END_SMALL_SCREEN
				: HEADING_STYLES.LEFT_END,
		],
	)
}
