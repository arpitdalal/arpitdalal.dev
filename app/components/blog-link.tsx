export default function BlogLink({
	children = 'Blog',
	className = 'underlined text-foreground/70',
}: {
	children?: React.ReactNode
	className?: string
}) {
	return (
		<a
			href="https://blog.arpitdalal.dev"
			className={className}
			target="_blank"
			rel="noreferrer"
		>
			{children}
		</a>
	)
}
