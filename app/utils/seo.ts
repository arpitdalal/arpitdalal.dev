export function getSocialMetas({
	url,
	title = 'Arpit Dalal - A full stack web developer',
	description = 'Come checkout my work experience, projects, and blog.',
	// image = getGenericSocialImage({
	// 	url,
	// 	words: title,
	// 	featuredImage: images.kodyFlyingSnowboardingBlue.id,
	// }),
	keywords = 'Web Developer Portfolio, Website Consulting, Javascript Consulting, Typescript Consulting, Nodejs Consulting, React Consulting, Wordpress Developer, Website Developer, Website Architect',
}: {
	image?: string
	url: string
	title?: string
	description?: string
	keywords?: string
}) {
	return [
		{ title },
		{ name: 'description', content: description },
		{ name: 'keywords', content: keywords },
		// { name: 'image', content: image },
		{ name: 'og:url', content: url },
		{ name: 'og:title', content: title },
		{ name: 'og:description', content: description },
		// { name: 'og:image', content: image },
		// {
		// 	name: 'twitter:card',
		// 	content: image ? 'summary_large_image' : 'summary',
		// },
		{ name: 'twitter:creator', content: '@kentcdodds' },
		{ name: 'twitter:site', content: '@kentcdodds' },
		{ name: 'twitter:title', content: title },
		{ name: 'twitter:description', content: description },
		// { name: 'twitter:image', content: image },
		{ name: 'twitter:image:alt', content: title },
	]
}
