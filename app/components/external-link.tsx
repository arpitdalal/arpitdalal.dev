import { cn } from '#app/utils/misc'
import { Icon } from './ui/icon'

interface ExternalLinkProps
	extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	href: string
	children: React.ReactNode
	className?: string
	applyRingClassName?: boolean
	applyUnderlineClassName?: boolean
	showIcon?: boolean
}

const baseClassName = 'cursor-new-tab text-foreground/70'
const underlineClassName = 'underlined'
const ringClassName =
	'ring-offset-background transition-colors outline-hidden focus-visible:ring-2 focus-within:ring-2 ring-ring ring-offset-2 inline-block'
const iconClassName = 'group/link'
export function ExternalLink({
	href,
	children,
	className = '',
	applyRingClassName = true,
	applyUnderlineClassName = true,
	showIcon = true,
	...props
}: ExternalLinkProps) {
	return (
		<a
			href={href}
			className={cn(
				baseClassName,
				applyRingClassName && ringClassName,
				applyUnderlineClassName && underlineClassName,
				showIcon && iconClassName,
				className,
			)}
			target="_blank"
			rel="noreferrer"
			data-content={children}
			data-umami-event="outbound-link"
			data-umami-event-url={href}
			{...props}
		>
			{children}
			{showIcon && (
				<Icon
					name="arrow-up-right-outline"
					className="ml-1 ease-in-out motion-safe:translate-y-px motion-safe:transition-transform motion-safe:group-hover/link:-translate-y-1 motion-safe:group-hover/link:translate-x-1 motion-safe:group-focus-visible/link:-translate-y-1 motion-safe:group-focus-visible/link:translate-x-1"
					aria-hidden
				/>
			)}
		</a>
	)
}
