import { Link } from '@remix-run/react'
import ExternalLink from '#app/components/external-link'
import { HeroHighlight, HighlightUnderline } from '#app/components/highlight'
import { Button } from '#app/components/ui/button'
import { Icon } from '#app/components/ui/icon'
import { WorkExperience } from '#app/components/work-experience'
import { socialLinks, workExperience } from '#app/routes/_marketing+/__data'

export default function Index() {
	return (
		<>
			<HeroHighlight className="pt-24">
				<div className="flex flex-col items-center justify-between gap-6">
					<h1 className="max-w-[15ch] text-center text-6xl motion-safe:animate-reveal-up sm:text-8xl">
						<span className="block text-sm uppercase text-foreground/70">
							Hello there, I'm
						</span>
						<span className="flex space-x-5 font-bold">
							<span className="first-letter:text-primary">Arpit</span>
							<span className="first-letter:text-primary">Dalal</span>
						</span>
					</h1>
					<p className="max-w-[60ch] px-8 text-center text-lg motion-safe:animate-reveal-up sm:text-xl">
						I'm a <HighlightUnderline>software engineer</HighlightUnderline> and
						a <HighlightUnderline>full-stack developer</HighlightUnderline>{' '}
						living in the Greater Toronto Area. I have a passion for building
						web applications and have a strong background in{' '}
						<HighlightUnderline>front-end development</HighlightUnderline>.
					</p>
					<div className="flex gap-5 motion-safe:animate-reveal-up">
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
					<div className="mt-2 flex gap-5 motion-safe:animate-reveal-up">
						{socialLinks.map(({ href, name, icon }) => (
							<Button
								key={href}
								variant="outline"
								size="icon"
								className="rounded-full"
								asChild
							>
								<ExternalLink href={href} aria-label={name}>
									<Icon name={icon} className="size-4" />
								</ExternalLink>
							</Button>
						))}
					</div>
				</div>
			</HeroHighlight>
			<WorkExperience workExperience={workExperience} />
		</>
	)
}
