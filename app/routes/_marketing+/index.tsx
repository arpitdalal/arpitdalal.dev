import { type MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import ExternalLink from '#app/components/external-link.tsx'
import { HeroHighlight } from '#app/components/hero-highlight.js'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.tsx'

export const meta: MetaFunction = () => [{ title: 'Epic Notes' }]

export default function Index() {
	return (
		<>
			<HeroHighlight>
				<div className="flex flex-col items-center justify-between gap-6">
					<h1 className="motion-safe:animate-reveal-up max-w-[15ch] text-center text-6xl sm:text-8xl">
						<span className="block text-sm uppercase text-foreground/70">
							Hello there, I'm
						</span>
						<span className="flex space-x-5 font-bold">
							<span className="first-letter:text-primary">Arpit</span>
							<span className="first-letter:text-primary">Dalal</span>
						</span>
					</h1>
					<p className="motion-safe:animate-reveal-up delay-400 max-w-[60ch] text-center text-lg sm:text-xl">
						I'm a software engineer and a full-stack developer living in the
						Greater Toronto Area. I have a passion for building web applications
						and have a strong background in front-end development.
					</p>
					<div className="motion-safe:animate-reveal-up flex gap-5 delay-700">
						<Button variant="outline" asChild>
							<Link to="contact">Contact me</Link>
						</Button>
						<Button asChild>
							<Link
								to="/resume.pdf"
								download="arpit-dalal-resume.pdf"
								reloadDocument
							>
								<Icon name="download-outline" className="size-4">
									Resume
								</Icon>
							</Link>
						</Button>
					</div>
					<div className="motion-safe:animate-reveal-up mt-2 flex gap-5 delay-1000">
						<Button
							variant="outline"
							size="icon"
							className="rounded-full"
							asChild
						>
							<ExternalLink href="https://arpit.im/x" aria-label="Twitter">
								<Icon name="brand-x-outline" className="size-4" />
							</ExternalLink>
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="rounded-full"
							asChild
						>
							<ExternalLink href="https://arpit.im/gh" aria-label="GitHub">
								<Icon name="brand-github-outline" className="size-4" />
							</ExternalLink>
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="rounded-full"
							asChild
						>
							<ExternalLink href="https://arpit.im/yt" aria-label="Youtube">
								<Icon name="brand-youtube-outline" className="size-4" />
							</ExternalLink>
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="rounded-full"
							asChild
						>
							<ExternalLink href="https://arpit.im/in" aria-label="LinkedIn">
								<Icon name="brand-linkedin-outline" className="size-4" />
							</ExternalLink>
						</Button>
					</div>
				</div>
			</HeroHighlight>
		</>
	)
}
