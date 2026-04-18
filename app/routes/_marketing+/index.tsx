import { href, Link, useLoaderData, type LoaderFunctionArgs } from 'react-router'
import { ClientOnly } from 'remix-utils/client-only'
import { BlogPosts, fetchBlogPosts } from '#app/components/blog-posts'
import {
	HeroHighlight,
	HeroHighlightDescription,
	HighlightUnderline,
	HeroHighlightH1,
} from '#app/components/highlight'
import { Notes, fetchNotes } from '#app/components/notes'
import { Projects } from '#app/components/projects'
import { SocialLinks } from '#app/components/social-links'
import { TalksSection } from '#app/components/talks-section'
import { Button } from '#app/components/ui/button'
// import { Icon } from '#app/components/ui/icon'
import { WorkExperience } from '#app/components/work-experience'
import {
	projectsData,
	socialLinksData,
	talksData,
	workExperienceData,
} from '#app/routes/_marketing+/__data'
import { formatDateWithHints } from '#app/utils/client-hints'

export async function loader({ request }: LoaderFunctionArgs) {
	const [blogPosts, notes] = await Promise.all([fetchBlogPosts(), fetchNotes()])

	const sortedTalks = [...talksData].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	)
	const talks = sortedTalks.slice(0, 2).map((talk) => ({
		...talk,
		formattedDate: formatDateWithHints(talk.date, request),
	}))

	return {
		blogPosts,
		notes,
		talks,
		projects: projectsData,
		workExperience: workExperienceData,
		socialLinks: socialLinksData,
	}
}

export default function Index() {
	const { blogPosts, notes, talks, projects, workExperience, socialLinks } =
		useLoaderData<typeof loader>()

	return (
		<>
			<HeroHighlight className="pt-24">
				<div className="flex flex-col items-center justify-between gap-6">
					<HeroHighlightH1 subtitle="Hello there, I'm">
						<span className="flex flex-wrap justify-center space-x-5 font-bold">
							<span className="first-letter:text-primary">Arpit</span>
							<span className="first-letter:text-primary">Dalal</span>
						</span>
					</HeroHighlightH1>
					<HeroHighlightDescription>
						I'm a <HighlightUnderline>software engineer</HighlightUnderline> and
						a <HighlightUnderline>full-stack developer</HighlightUnderline>{' '}
						living in the Greater Toronto Area, Canada. I have a passion for
						building web applications and have a strong background in{' '}
						<HighlightUnderline>front-end development</HighlightUnderline>.
					</HeroHighlightDescription>
					<div className="motion-safe:animate-slide-down flex gap-5 [--slide-down-delay:500ms] motion-safe:opacity-0">
						<Button variant="outline" asChild>
							<Link to={href('/contact')} data-umami-event="hero-contact-link">
								Contact me
							</Link>
						</Button>
						{/* <Button asChild>
							<Link
								to="/resume.pdf"
								data-umami-event="hero-resume-download-link"
								className="group/resume flex gap-2"
								download="arpit-dalal-resume.pdf"
								reloadDocument
							>
								<span>Resume</span>
								<Icon
									name="download-outline"
									className="motion-safe:group-hover/resume:animate-bounce-down size-4"
								/>
							</Link>
						</Button> */}
					</div>
					<SocialLinks
						socialLinks={socialLinks}
						className="motion-safe:animate-slide-down mt-2 [--slide-down-delay:700ms] motion-safe:opacity-0"
					/>
				</div>
			</HeroHighlight>
			<ClientOnly
				fallback={
					<WorkExperience workExperience={workExperience} jsEnabled={false} />
				}
			>
				{() => <WorkExperience workExperience={workExperience} jsEnabled />}
			</ClientOnly>
			<ClientOnly
				fallback={<BlogPosts blogPosts={blogPosts} jsEnabled={false} />}
			>
				{() => <BlogPosts blogPosts={blogPosts} jsEnabled />}
			</ClientOnly>
			<ClientOnly fallback={<Notes notes={notes} jsEnabled={false} />}>
				{() => <Notes notes={notes} jsEnabled />}
			</ClientOnly>
			<ClientOnly
				fallback={<TalksSection talks={talks} jsEnabled={false} />}
			>
				{() => <TalksSection talks={talks} jsEnabled />}
			</ClientOnly>
			<ClientOnly fallback={<Projects projects={projects} jsEnabled={false} />}>
				{() => <Projects projects={projects} jsEnabled />}
			</ClientOnly>
		</>
	)
}
