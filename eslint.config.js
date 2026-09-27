import { default as defaultConfig } from '@epic-web/config/eslint'
import reactCompiler from 'eslint-plugin-react-compiler'

/** @type {import("eslint").Linter.Config} */
export default [
	...defaultConfig,
	{
		plugins: {
			'react-compiler': reactCompiler,
		},
		files: ['**/*.{ts,tsx,js,jsx}'],
		rules: {
			'react-compiler/react-compiler': 'error',
		},
	},
	{
		// Generated, gitignored, and absent in CI, so linting them here would
		// only ever see files no other machine has. tsconfig picks the sprite's
		// types up (it is a real module now), so a leftover .d.ts from the
		// script this replaced would otherwise fail lint as a file "not found
		// by the project service".
		ignores: ['.react-router/*', 'app/components/ui/icons/*'],
	},
]
