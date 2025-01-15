import { type IconName } from '#app/components/ui/icon'

type SocialLink = {
	name: string
	href: string
	icon: IconName
}
export const socialLinks = [
	{
		name: 'Twitter',
		href: 'https://arpit.im/x',
		icon: 'brand-x-outline',
	},
	{
		name: 'GitHub',
		href: 'https://arpit.im/gh',
		icon: 'brand-github-outline',
	},
	{
		name: 'Youtube',
		href: 'https://arpit.im/yt',
		icon: 'brand-youtube-outline',
	},
	{
		name: 'LinkedIn',
		href: 'https://arpit.im/in',
		icon: 'brand-linkedin-outline',
	},
] satisfies SocialLink[]

export type WorkExperience = {
	title: string
	previousTitles?: string[]
	link: string
	company: string
	location: string
	description: string
	startDate: string
	endDate: string
	technologies: string[]
}
export const workExperience = [
	{
		title: 'Web Developer Product Specialist',
		link: 'https://points.com',
		company: 'Points',
		location: 'ON, Canada',
		description:
			'Develop production-ready storefronts for millions of users, collaborating with multiple stakeholders to formulate comprehensive plans for product development, testing, and launch.',
		startDate: 'Aug 2021',
		endDate: 'Present',
		technologies: ['React', 'JavaScript', 'Typescript', 'Node', 'PHP'],
	},
	{
		title: 'Web Developer',
		link: 'https://reddingdesigns.com',
		company: 'Redding Designs',
		location: 'ON, Canada',
		description:
			'Work collaboratively with clients and in-house teams to provide fast, secure, responsive and client-acclaimed full-stack web applications for user-optimized experiences.',
		startDate: 'Aug 2020',
		endDate: 'Jul 2021',
		technologies: [
			'React',
			'Typescript',
			'Bootstrap',
			'Node',
			'PHP',
			'WordPress',
		],
	},
	{
		title: 'Full Stack Web Developer',
		link: 'https://revolution.ca',
		company: 'Revolution Media',
		location: 'PE, Canada',
		description:
			'Create robust full-stack web solutions tailored to client needs, leveraging the most suitable technology stack for optimal performance and accessibility.',
		startDate: 'Jul 2019',
		endDate: 'Apr 2020',
		technologies: [
			'React',
			'Typescript',
			'Tailwind CSS',
			'Node',
			'PHP',
			'WordPress',
		],
	},
	{
		title: 'Full Stack Developer',
		link: 'https://bigsurge.ca/',
		company: 'Big Surge',
		location: 'PE, Canada',
		description:
			'Collaborate within a dynamic team, contributing to multiple codebases in a fast-paced startup. Utilize React, Next, Redux, and TypeScript to craft highly responsive user interfaces.',
		startDate: 'Feb 2019',
		endDate: 'Jun 2019',
		technologies: ['React', 'Next', 'Typescript', 'Node'],
	},
	{
		title: 'Junior Developer',
		link: 'https://www.linkedin.com/company/auberon-canada-inc/',
		company: 'Auberon',
		location: 'Remote, Canada',
		description:
			'Gained valuable experience and proficiency in HTML, CSS, React, JavaScript, and Node, contributing actively to projects and accelerating learning curve.',
		startDate: 'Feb 2017',
		endDate: 'May 2018',
		technologies: ['JavaScript', 'Node', 'React', 'HTML', 'CSS'],
	},
] satisfies WorkExperience[]

export type Project = {
	title: string
	link: string
	imageUrl: string
	imageAlt: string
	description: string
	technologies?: string[]
	githubLink?: string
	openSource?: boolean
	hightLightLinks?: Array<{ name: string; href: string }>
}
export const projects = [
	{
		title: 'X̂ Man',
		link: 'https://xman.arpitdalal.dev/',
		imageUrl:
			'https://res.cloudinary.com/arpitdalal-dev/image/upload/w_500/v1715629303/arpitdalal-dev/XMAN-home-page_tq33fw.png',
		imageAlt: 'X̂ Man home page',
		description:
			'A minimal finance management app for individuals. Built with productivity in mind.',
		technologies: [
			'React',
			'Typescript',
			'Remix',
			'Tailwind CSS',
			'Node',
			'Express',
			'Prisma',
			'SQLite',
		],
	},
	{
		title: 'Epic Content Stack',
		openSource: true,
		link: 'https://arpit.im/epc',
		imageUrl:
			'https://res.cloudinary.com/arpitdalal-dev/image/upload/w_500/v1715634672/arpitdalal-dev/epic-gh_cuncf0.png',
		imageAlt: 'Epic Content Stack GitHub page',
		description:
			'Stripped down Epic Stack for content sites, no DB and Auth Code.',
		hightLightLinks: [
			{
				name: 'GitHub',
				href: 'https://github.com/arpit-dalal/epic-content-stack',
			},
			{
				name: 'X',
				href: 'https://x.com/kentcdodds/status/1782815976331047404',
			},
		],
	},
] satisfies Project[]
