interface ExternalLinkProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	href: string
	children: React.ReactNode
	className?: string
}

export default function ExternalLink({
	href,
	children,
	className = 'underlined text-foreground/70',
	...props
}: ExternalLinkProps) {
	return (
		<a
			href={href}
			className={className}
			target="_blank"
			rel="noreferrer"
			{...props}
		>
			{children}
		</a>
	)
}
