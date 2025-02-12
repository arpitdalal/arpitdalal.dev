import typographyPlugin from '@tailwindcss/typography'
import svgToDataUri from 'mini-svg-data-uri'
import { type Config } from 'tailwindcss'
import animatePlugin from 'tailwindcss-animate'
import radixPlugin from 'tailwindcss-radix'
import { extendedTheme } from './app/utils/extended-theme'

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
	plugins: [
		typographyPlugin,
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
					'bg-dot-thick': (value: any) => ({
						backgroundImage: `url("${svgToDataUri(
							`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="2.5"></circle></svg>`,
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
