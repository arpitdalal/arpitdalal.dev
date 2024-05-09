import { cn } from '#app/utils/misc'

interface ExternalLinkProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	href: string
	children: React.ReactNode
	className?: string
	applyBaseClassName?: boolean
}

const baseClassName =
	'ring-offset-background transition-colors outline-none focus-visible:ring-2 focus-within:ring-2 ring-ring ring-offset-2'
export default function ExternalLink({
	href,
	children,
	className = 'underlined text-foreground/70',
	applyBaseClassName = true,
	...props
}: ExternalLinkProps) {
	return (
		<a
			href={href}
			className={cn(applyBaseClassName && baseClassName, className)}
			target="_blank"
			rel="noreferrer"
			{...props}
		>
			{children}
		</a>
	)
}
