import svgToDataUri from 'mini-svg-data-uri'
import { type Config } from 'tailwindcss'
import animatePlugin from 'tailwindcss-animate'
import radixPlugin from 'tailwindcss-radix'
import { marketingPreset } from './app/routes/_marketing+/tailwind-preset'
import { extendedTheme } from './app/utils/extended-theme.ts'

const {
	default: flattenColorPalette,
} = require('tailwindcss/lib/util/flattenColorPalette')

export default {
	content: ['./app/**/*.{ts,tsx,jsx,js}'],
	darkMode: 'class',
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: extendedTheme,
	},
	presets: [marketingPreset],
	plugins: [
		animatePlugin,
		radixPlugin,
		function ({
			matchUtilities,
			theme,
		}: {
			matchUtilities: Function
			theme: Function
		}) {
			matchUtilities(
				{
					'bg-dot': (value: string) => ({
						backgroundImage: `url("${svgToDataUri(
							`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`,
						)}")`,
					}),
				},
				{
					values: flattenColorPalette(theme('backgroundColor')),
					type: 'color',
				},
			)
		},
	],
} satisfies Config
