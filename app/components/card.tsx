import { cn } from '#app/utils/misc'
import { ExternalLink } from './external-link'
import { Badge } from './ui/badge'

/**
 * @example
 * <Card>
 *  <CardImage imageUrl="https://via.placeholder.com/150" imageAlt="Card Image" />
 *  <CardContent>
 *    <CardTitle title="Card Title" link="https://example.com" />
 *    <CardDescription>Card Description</CardDescription>
 *    <CardTags tags={['Tag 1', 'Tag 2', 'Tag 3']} />
 *  </CardContent>
 * </Card>
 */
export function Card({ children }: { children: React.ReactNode }) {
	return (
		<li>
			<article className="group relative grid py-8 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:group-hover/ol:opacity-50 lg:hover:opacity-100!">
				<div
					className="motion-safe:lg:group-hover:bg-accent/60 absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block motion-safe:lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] motion-safe:lg:group-hover:drop-shadow-lg"
					aria-hidden
				/>
				{children}
			</article>
		</li>
	)
}

export function CardImage({
	imageUrl,
	imageAlt,
}: {
	imageUrl: string
	imageAlt: string
}) {
	return (
		<div className="text-foreground/70 z-10 mt-1 mb-2 font-semibold tracking-wide uppercase sm:col-span-2 sm:pr-3 sm:text-right">
			<img src={imageUrl} alt={imageAlt} className="w-full drop-shadow-2xl" />
		</div>
	)
}

export function CardContent({ children }: { children: React.ReactNode }) {
	return <div className="z-10 max-sm:mt-4 sm:col-span-6">{children}</div>
}

export function CardTitle({
	title,
	link,
	isNew,
}: {
	title: string
	link?: string
	isNew?: boolean
}) {
	return (
		<h3 className="relative font-medium">
			{isNew ? (
				<Badge
					variant="outline"
					className="bg-primary text-primary-foreground absolute -top-6"
				>
					New
				</Badge>
			) : // <span className="bg-primary text-primary-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium">
			// 	New
			// </span>
			null}
			{link ? (
				<ExternalLink
					href={link}
					className="hover:text-primary focus-visible:text-primary text-foreground items-baseline leading-tight font-medium"
					aria-label={`${title} (opens in a new tab)`}
					applyUnderlineClassName={false}
				>
					{/* This is for making the link clickable on the whole card */}
					<span
						className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:-inset-x-6 md:-inset-y-4 lg:block"
						aria-hidden
					></span>
					<span>{title}</span>
				</ExternalLink>
			) : (
				<span className="hover:text-primary text-foreground leading-tight font-medium">
					{title}
				</span>
			)}
		</h3>
	)
}

export function CardDescription({
	children,
	className,
}: {
	children: React.ReactNode
	className?: string
}) {
	return (
		<p className={cn('text-foreground/70 mt-2 leading-normal', className)}>
			{children}
		</p>
	)
}

export function CardTags({ tags }: { tags: string[] }) {
	return (
		<ul className="mt-4 flex flex-wrap gap-2" aria-label="Tags">
			{tags.map((tag) => (
				<Badge key={tag}>{tag}</Badge>
			))}
		</ul>
	)
}
