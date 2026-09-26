import path from 'node:path'
import { fileURLToPath } from 'node:url'
import esbuild from 'esbuild'
import fsExtra from 'fs-extra'
import { globSync } from 'glob'

const pkg = fsExtra.readJsonSync(path.join(process.cwd(), 'package.json'))

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const here = (...s: Array<string>) => path.join(__dirname, ...s)
const globsafe = (s: string) => s.replace(/\\/g, '/')

const allFiles = globSync(globsafe(here('../server/**/*.*')), {
	ignore: [
		'server/dev-server.js', // for development only
		'**/tsconfig.json',
		'**/eslint*',
		'**/__tests__/**',
	],
})

const entries = []
for (const file of allFiles) {
	if (/\.(ts|js|tsx|jsx)$/.test(file)) {
		entries.push(file)
	} else {
		const dest = file.replace(here('../server'), here('../server-build'))
		fsExtra.ensureDirSync(path.parse(dest).dir)
		fsExtra.copySync(file, dest)
		console.log(`copied: ${file.replace(`${here('../server')}/`, '')}`)
	}
}

console.log()
console.log('building...')

// esbuild's node target must be a single X[.Y[.Z]] version, but engines.node
// is a semver range. Take the lowest version the range admits so the output
// still runs on the oldest supported runtime.
function lowestSupportedNode(range: string) {
	const parts = [...range.matchAll(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/g)]
		.map(([, major, minor, patch]) => ({
			major: Number(major),
			minor: minor === undefined ? 0 : Number(minor),
			patch: patch === undefined ? 0 : Number(patch),
		}))
		.sort((a, b) => a.major - b.major || a.minor - b.minor || a.patch - b.patch)

	const lowest = parts[0]
	if (!lowest) {
		throw new Error(`Could not read a version out of engines.node: ${range}`)
	}
	return `${lowest.major}.${lowest.minor}.${lowest.patch}`
}

const nodeTarget = `node${lowestSupportedNode(pkg.engines.node)}`
console.log(`target: ${nodeTarget}`)

esbuild
	.build({
		entryPoints: entries,
		outdir: here('../server-build'),
		target: [nodeTarget],
		platform: 'node',
		sourcemap: true,
		format: 'esm',
		logLevel: 'info',
	})
	.catch((error: unknown) => {
		console.error(error)
		process.exit(1)
	})
