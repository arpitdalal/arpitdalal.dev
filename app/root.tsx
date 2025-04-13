import {
	href,
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useLoaderData,
} from 'react-router'
import { ClientOnly } from 'remix-utils/client-only'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import appleTouchIconAssetUrl from '#app/assets/favicons/apple-touch-icon.png'
import faviconAssetUrl from '#app/assets/favicons/favicon.png'
import { GeneralErrorBoundary } from '#app/components/error-boundary'
import { ExternalLink } from '#app/components/external-link'
import { Header } from '#app/components/header'
import { Logo, LogoCircle, LogoImage, LogoSpinner } from '#app/components/logo'
import { Newsletter } from '#app/components/newsletter'
import { EpicProgress } from '#app/components/progress-bar'
import { SocialLinks } from '#app/components/social-links'
import { href as iconsHref } from '#app/components/ui/icon'
import { socialLinksData } from '#app/routes/_marketing+/__data'
import tailwindStyleSheetUrl from '#app/styles/tailwind.css?url'
import { usePosthogPageView } from '#app/utils/analytics'
import { ClientHintCheck, getHints, useHints } from '#app/utils/client-hints'
import { getEnv } from '#app/utils/env.server'
import { honeypot } from '#app/utils/honeypot.server'
import { getDomainUrl, getUrl } from '#app/utils/misc'
import { useNonce } from '#app/utils/nonce-provider'
import { getSocialMetas } from '#app/utils/seo'
import { type Theme } from '#types/index'
import { type Route } from './+types/root'

export const links: Route.LinksFunction = () => {
	return [
		{ rel: 'preload', href: iconsHref, as: 'image' },
		// { rel: "preload", href: fontStyleStyleSheetUrl, as: "style" },
		{ rel: 'preload', href: tailwindStyleSheetUrl, as: 'style' },
		{
			rel: 'icon',
			href: '/favicon.ico',
			sizes: '48x48',
		},
		{ rel: 'icon', type: 'image/png', href: faviconAssetUrl },
		{ rel: 'apple-touch-icon', href: appleTouchIconAssetUrl },
		{
			rel: 'manifest',
			href: '/site.webmanifest',
			crossOrigin: 'use-credentials',
		} as const, // need this to make TS happy
		// { rel: "stylesheet", href: fontStyleStyleSheetUrl },
		{ rel: 'stylesheet', href: tailwindStyleSheetUrl },
	].filter(Boolean)
}

export const meta: Route.MetaFunction = ({ data }) => {
	const requestInfo = data?.requestInfo
	return [
		{ viewport: 'width=device-width,initial-scale=1,viewport-fit=cover' },
		{
			'theme-color': requestInfo?.hints.theme === 'dark' ? '#1F2028' : '#FFF',
		},
		...getSocialMetas({
			url: getUrl(requestInfo),
		}),
	]
}

export async function loader({ request }: Route.LoaderArgs) {
	const honeyProps = await honeypot.getInputProps()

	return {
		requestInfo: {
			hints: getHints(request),
			origin: getDomainUrl(request),
			path: new URL(request.url).pathname,
		},
		ENV: getEnv(),
		honeyProps,
	}
}

function Document({
	children,
	nonce,
	theme,
	env = {},
}: {
	children: React.ReactNode
	nonce: string
	theme?: Theme
	env?: Record<string, string | undefined>
}) {
	const { theme: hintTheme } = useHints()
	usePosthogPageView()

	return (
		<html
			lang="en"
			className={`${theme || hintTheme || 'light'} h-full overflow-x-hidden`}
		>
			<head>
				<ClientHintCheck nonce={nonce} />
				<Meta />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				<Links />
			</head>
			<body className="bg-background text-foreground">
				{children}
				<script
					nonce={nonce}
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(env)}`,
					}}
				/>
				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
				<script
					async
					defer
					src={`https://${env.UMAMI_DOMAIN}/${env.UMAMI_SCRIPT_NAME}`}
					data-website-id={env.UMAMI_WEBSITE_ID}
					data-domains={env.UMAMI_DOMAINS}
				></script>
			</body>
		</html>
	)
}

export function Layout({ children }: { children: React.ReactNode }) {
	// if there was an error running the loader, data could be missing
	const data = useLoaderData<typeof loader | null>()
	const nonce = useNonce()

	return (
		<Document
			nonce={nonce}
			theme={data?.requestInfo?.hints.theme}
			env={data?.ENV}
		>
			{children}
		</Document>
	)
}

function App() {
	return (
		<>
			<div className="flex min-h-screen flex-col justify-between">
				<ClientOnly fallback={<Header jsEnabled={false} />}>
					{() => <Header jsEnabled />}
				</ClientOnly>
				<main id="main" className="flex-1 pb-20">
					<Outlet />
				</main>
				<Footer />
			</div>
			<EpicProgress />
		</>
	)
}

function AppWithProviders() {
	const data = useLoaderData<typeof loader>()

	return (
		<HoneypotProvider {...data.honeyProps}>
			<App />
		</HoneypotProvider>
	)
}

export default AppWithProviders

export const headerAndFooterCommonInternalLinks = [
	{ title: 'Contact', link: href('/contact') },
	{ title: 'Uses', link: href('/uses') },
]
export const headerAndFooterCommonExternalLinks = [
	{ title: 'Blog', link: 'https://arpit.im/b' },
	{ title: 'Notes', link: 'https://arpit.im/b/notes' },
]
const footerOnlyLegalLinks = [
	{ title: 'Terms', link: href('/terms') },
	{ title: 'Privacy', link: href('/privacy') },
]
const footerOnlyResourcesLinks = [
	{ title: 'Subscribe', link: href('/subscribe') },
	{ title: 'RSS', link: 'https://arpit.im/b/rss.xml' },
]
const footerOnlyExternalLinks = [
	{
		title: 'Analytics',
		link: ENV?.UMAMI_PUBLIC_ANALYTICS_URL
			? ENV.UMAMI_PUBLIC_ANALYTICS_URL
			: undefined,
	},
]

function Footer() {
	return (
		<footer className="border-foreground/40 border-t">
			<div className="container flex flex-wrap items-start justify-between gap-10 py-5">
				<div className="grid gap-4">
					<Link
						to={href('/')}
						className="group ring-ring ring-offset-background z-10 flex items-center gap-4 ring-offset-2 outline-hidden transition-colors focus-within:ring-2 focus-visible:ring-2"
					>
						<Logo>
							<LogoCircle />
							<LogoSpinner />
							<LogoImage />
						</Logo>
						<span
							className="underlined text-h5 xs:text-h2"
							data-content="Arpit Dalal"
						>
							Arpit Dalal
						</span>
					</Link>
					<SocialLinks socialLinks={socialLinksData} />
				</div>
				<nav className="flex grow flex-wrap gap-10">
					<div>
						<strong className="text-lg">Pages</strong>
						<ul className="mt-3 flex flex-col gap-1">
							<li>
								<Link
									className="underlined text-foreground/70"
									to={href('/')}
									data-content="Home"
								>
									Home
								</Link>
							</li>
							{headerAndFooterCommonInternalLinks.map((link) => (
								<li key={link.title}>
									<Link
										to={link.link}
										className="underlined text-foreground/70"
										data-content={link.title}
									>
										{link.title}
									</Link>
								</li>
							))}
							{headerAndFooterCommonExternalLinks.map((link) => (
								<li key={link.title}>
									<ExternalLink
										href={`${link.link}?utm_source=arpitdalal.dev&utm_medium=footer&utm_campaign=portfolio`}
										applyRingClassName={false}
									>
										{link.title}
									</ExternalLink>
								</li>
							))}
							{footerOnlyExternalLinks.map((link) => (
								<li key={link.title}>
									<ExternalLink
										href={`${link.link}?utm_source=arpitdalal.dev&utm_medium=footer&utm_campaign=portfolio`}
										applyRingClassName={false}
									>
										{link.title}
									</ExternalLink>
								</li>
							))}
						</ul>
					</div>
					<div>
						<strong className="text-lg">Legal</strong>
						<ul className="mt-3 flex flex-col gap-1">
							{footerOnlyLegalLinks.map((link) => (
								<li key={link.title}>
									<Link
										to={link.link}
										className="underlined text-foreground/70"
										data-content={link.title}
									>
										{link.title}
									</Link>
								</li>
							))}
						</ul>
					</div>
					<div>
						<strong className="text-lg">Resources</strong>
						<ul className="mt-3 flex flex-col gap-1">
							{footerOnlyResourcesLinks.map((link) => (
								<li key={link.title}>
									<Link
										to={link.link}
										className="underlined text-foreground/70"
										data-content={link.title}
									>
										{link.title}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</nav>
				<div>
					<h2 className="xs:text-2xl text-lg font-bold">
						Subscribe to my newsletter
					</h2>
					<p className="text-foreground/70 mt-2 text-sm">
						Get the latest updates from me directly to your inbox, no spam.
					</p>
					<Newsletter />
				</div>
			</div>
			<div className="container mb-5">
				<p className="text-foreground/70 text-sm">
					Arpit Dalal &copy; 2020 - {new Date().getFullYear()}. All rights
					reserved.
				</p>
			</div>
		</footer>
	)
}

export function ErrorBoundary() {
	const nonce = useNonce()

	return (
		<Document nonce={nonce}>
			<GeneralErrorBoundary />
		</Document>
	)
}
