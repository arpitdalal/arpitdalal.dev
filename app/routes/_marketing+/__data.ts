import { type IconName } from '#app/components/ui/icon'

export type SocialLink = {
	name: string
	href: string
	icon: IconName
}
export const socialLinksData = [
	{
		name: 'GitHub',
		href: 'https://arpit.im/gh',
		icon: 'brand-github-outline',
	},
	{
		name: 'Twitter',
		href: 'https://arpit.im/x',
		icon: 'brand-x-outline',
	},
	{
		name: 'Bluesky',
		href: 'https://arpit.im/bsky',
		icon: 'brand-bluesky-outline',
	},
	{
		name: 'LinkedIn',
		href: 'https://arpit.im/in',
		icon: 'brand-linkedin-outline',
	},
	{
		name: 'Youtube',
		href: 'https://arpit.im/yt',
		icon: 'brand-youtube-outline',
	},
] satisfies SocialLink[]

export type WorkExperience = {
	title: string
	link: string
	company: string
	location: string
	description: string
	startDate: string
	endDate: string
	tags: string[]
}
export const workExperienceData = [
	{
		title: 'Software Engineer',
		link: 'https://plusgrade.com',
		company: 'Plusgrade',
		location: 'ON, Canada',
		description:
			'Develop a line of e-commerce products for ancillary revenue in the airline, hotel, rail, and cruise industries.',
		startDate: 'Mar 2025',
		endDate: 'Present',
		tags: [
			'React',
			'Typescript',
			'Node',
			'Test Automation',
			'Bitbucket',
			'Docker',
			'AWS',
			'Datadog',
			'Jira',
		],
	},
	{
		title: 'Web Developer Product Specialist',
		link: 'https://points.com',
		company: 'Points (a Plusgrade company)',
		location: 'ON, Canada',
		description:
			'Develop production-ready storefronts for millions of users, collaborating with multiple stakeholders to formulate comprehensive plans for product development, testing, and launch.',
		startDate: 'Aug 2021',
		endDate: 'Mar 2025',
		tags: [
			'Node',
			'PHP',
			'React',
			'Typescript',
			'JavaScript',
			'Remix',
			'GitLab',
			'Jira',
			'Docker',
		],
	},
	{
		title: 'Web Developer',
		link: 'https://reddingdesigns.com',
		company: 'Redding Designs',
		location: 'ON, Canada',
		description:
			'Work collaboratively with clients and in-house teams to provide fast, secure, responsive and client-acclaimed full-stack web applications for user-optimized experiences.',
		startDate: 'Aug 2020',
		endDate: 'Aug 2021',
		tags: [
			'React',
			'Typescript',
			'Bootstrap',
			'Node',
			'PHP',
			'WordPress',
			'Bitbucket',
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
		endDate: 'May 2020',
		tags: [
			'React',
			'Typescript',
			'jQuery',
			'Tailwind CSS',
			'Node',
			'PHP',
			'WordPress',
			'Digital Ocean',
			'Bitbucket',
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
		endDate: 'Jul 2019',
		tags: ['React', 'Next.js', 'JavaScript', 'Node', 'Bitbucket'],
	},
	{
		title: 'Junior Developer',
		link: 'https://www.linkedin.com/company/auberon-canada-inc/',
		company: 'Auberon',
		location: 'Remote, Canada',
		description:
			'Gained valuable experience and proficiency in HTML, CSS, React, JavaScript, and Node, contributing actively to projects and accelerating learning curve.',
		startDate: 'Feb 2017',
		endDate: 'Jun 2018',
		tags: ['JavaScript', 'Node', 'React', 'HTML', 'CSS', 'Bitbucket'],
	},
] satisfies WorkExperience[]

export type Project = {
	title: string
	link: string
	imageUrl: string
	imageAlt: string
	description: string
	tags?: string[]
	githubLink?: string
	openSource?: boolean
	hightLightLinks?: Array<{ name: string; href: string }>
}
export const projectsData = [
	{
		title: 'X Man',
		link: 'https://arpit.im/xman',
		imageUrl:
			'https://res.cloudinary.com/arpitdalal-dev/image/upload/w_500/v1715629303/arpitdalal-dev/XMAN-home-page_tq33fw.png',
		imageAlt: 'X Man home page',
		description:
			'A minimal finance management app for individuals. Built with productivity in mind.',
		tags: [
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
		link: 'https://arpit.im/ecs',
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
		tags: ['Open Source'],
	},
] satisfies Project[]

export type Use = {
	title: string
	useCard: UseCard[]
}
export type UseCard = {
	title: string
	titleLink?: string
	description: string
	subDescription?: string
}
export const usesData = [
	{
		title: 'Workstation',
		useCard: [
			{
				title: 'MacBook Pro 14',
				titleLink: 'https://www.apple.com/macbook-pro/',
				description: 'M2 Pro 2023, 32 GB, 512 SSD',
				subDescription:
					'Upgraded chip and memory to live stream and edit photos, videos.',
			},
			{
				title: 'Autonomous SmartDesk 2',
				titleLink:
					'https://www.autonomous.ai/en-CA/standing-desks/autonomous-desk-eureka',
				description: 'Matte black desk top - 53" x 29" - black frame',
				subDescription: 'A sit-stand desk with 4 memory positions.',
			},
			{
				title: 'ErgoChair Pro',
				titleLink:
					'https://www.autonomous.ai/en-CA/office-chairs/ergonomic-chair',
				description: 'Great lumbar and neck support.',
				subDescription: 'Helps me avoid back and neck pain.',
			},
			{
				title: 'Keychron K4 Wireless Mechanical Keyboard',
				titleLink: 'https://amzn.to/3EAOisP',
				description:
					'96% layout, aluminum frame, version 2, Gateron Brown switches',
				subDescription: 'I love the tactile feel of the switches.',
			},
			{
				title: 'Apple Magic Trackpad',
				titleLink:
					'https://www.apple.com/ca/shop/product/MXKA3AM/A/magic-trackpad-usb%E2%80%91c-black-multi-touch-surface',
				description: 'Black multi-touch surface',
				subDescription: 'I love the gesture controls.',
			},
		],
	},
	{
		title: 'Accessories',
		useCard: [
			{
				title: 'Apple Airpods Pro 2nd Generation',
				titleLink: 'https://www.apple.com/ca/airpods-pro/',
				description: 'Lightning charging case',
				subDescription:
					'Amazing sound quality, easy to carry, and works awesome within the ecosystem.',
			},
			{
				title: 'SOJITAS Non-Slip Desk Pad',
				titleLink: 'https://amzn.to/42YF4AM',
				description: 'Waterproof PU leather desk mat, 31.5" x 15.7"',
				subDescription: 'Easy to clean and waterproof leather desk pad.',
			},
			{
				title: 'RioRand Portable Laptop Desk Stand',
				titleLink: 'https://amzn.to/4hWSqSf',
				description: 'Foldable ergonomic computer stand',
				subDescription: 'Keeps my laptop at eye level reducing neck strain.',
			},
			{
				title: 'Gimars Memory Foam Mouse Pad',
				titleLink: 'https://amzn.to/3WWgI6z',
				description:
					'Non slip mouse pad with comfortable memory foam hand rest',
				subDescription: 'Helps me avoid wrist pain and rashes.',
			},
			{
				title: 'Everlasting Comfort Memory Foam Foot Rest',
				titleLink: 'https://amzn.to/4hDvwQ7',
				description: 'Under desk memory foam foot rest',
				subDescription: 'Keeps my legs from falling asleep.',
			},
		],
	},
	{
		title: 'Applications',
		useCard: [
			{
				title: 'Arc',
				titleLink: 'https://arc.net/gift/5fe6aaa/',
				description: 'Daily driver',
				subDescription:
					'I love its spaces feature. Very convenient to switch between work and personal tabs.',
			},
			{
				title: 'Cursor',
				titleLink: 'https://www.cursor.com/refer-a-friend?code=0WBM5A44721602',
				description: 'Code editor',
				subDescription: 'Makes coding open source stuff a breeze.',
			},
			{
				title: 'Vscode',
				titleLink: 'https://code.visualstudio.com/',
				description: 'Code editor',
				subDescription: 'All things work related.',
			},
			{
				title: 'Ghostty',
				titleLink: 'https://ghostty.org/',
				description: 'Platform-native, fast, and feature-rich terminal',
				subDescription:
					'Very customizable with native features. Blazingly fast.',
			},
			{
				title: 'Raycast',
				titleLink: 'https://www.raycast.com/',
				description: 'Bread and butter',
				subDescription: "Can't imagine being productive without it.",
			},
			{
				title: 'Apple Notes',
				titleLink: 'https://www.icloud.com/notes/',
				description: 'Note taking',
				subDescription: 'Quickly jot down ideas, thoughts, and important info.',
			},
			{
				title: 'Notion',
				titleLink: 'https://www.notion.so/',
				description: 'Managing projects',
				subDescription: 'Create databases, pages, and more to manage projects.',
			},
		],
	},
	{
		title: 'Services',
		useCard: [
			{
				title: 'Umami',
				titleLink: 'https://umami.is/',
				description: 'Self-hosted analytics',
				subDescription:
					'My preferred anonymous and GDPR compliant web analytics.',
			},
			{
				title: 'PostHog',
				titleLink: 'https://posthog.com/',
				description: 'Product analytics, feature flags, and more',
				subDescription:
					'Advanced use-case for tracking user journey, adding feature flags, etc.',
			},
			{
				title: 'Fly.io',
				titleLink: 'https://fly.io/',
				description: 'Cloud hosting platform',
				subDescription: 'Amazing for deploying anything!',
			},
			{
				title: 'Cloudinary',
				titleLink: 'https://cloudinary.com/',
				description: 'Image hosting platform',
				subDescription: 'Amazing for hosting images and videos.',
			},
			{
				title: 'GitHub',
				titleLink: 'https://github.com/',
				description: 'Code hosting platform',
				subDescription:
					'I host all open/closed source code on GitHub and run CI/CD using GitHub Actions.',
			},
			{
				title: 'Porkbun',
				titleLink: 'https://porkbun.com/',
				description: 'Domain registrar',
				subDescription: 'My go-to for registering domains.',
			},
			{
				title: 'iCloud+',
				titleLink: 'https://www.icloud.com/',
				description: 'Family sharing',
				subDescription:
					'Sync and backup my devices. Also has a lot of other features.',
			},
		],
	},
	{
		title: 'Configuration',
		useCard: [
			{
				title: 'Night Owl',
				titleLink:
					'https://marketplace.visualstudio.com/items?itemName=sdras.night-owl',
				description: 'VSCode theme',
				subDescription: 'Love the colors.',
			},
			{
				title: 'VSCode Icons',
				titleLink:
					'https://marketplace.cursorapi.com/items?itemName=vscode-icons-team.vscode-icons',
				description: 'VSCode sidebar icons',
				subDescription: 'Makes it easier to identify files and folders.',
			},
			{
				title: 'Fira Code',
				titleLink: 'https://github.com/tonsky/FiraCode',
				description: 'Preferred coding font',
				subDescription:
					'Makes reading code easy and enjoyable with its ligatures.',
			},
		],
	},
] satisfies Use[]
