import { cn } from '#app/utils/misc'

export function Logo({
	className,
	children,
}: {
	className?: string
	children: React.ReactNode
}) {
	return (
		<div
			className={cn(
				'xs:size-16 relative inline-flex size-12 items-end justify-center rounded-full',
				className,
			)}
			aria-hidden
		>
			{children}
		</div>
	)
}

export function LogoSpinner({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				'duration-default group-hover:duration-hover group-focus:duration-hover group-active:duration-active absolute cursor-pointer motion-safe:animate-spin',
				className,
			)}
		>
			<svg className="xs:size-16 size-12" viewBox="0 0 56 56">
				<path
					d="M29.465,0.038373A28,28,0,0,1,52.948,40.712L51.166,39.804A26,26,0,0,0,29.361,2.0356Z"
					className="fill-current"
				></path>
				<path
					d="M51.483,43.250A28,28,0,0,1,4.5172,43.250L6.1946,42.161A26,26,0,0,0,49.805,42.161Z"
					className="fill-current"
				></path>
				<path
					d="M3.0518,40.712A28,28,0,0,1,26.535,0.038373L26.639,2.0356A26,26,0,0,0,4.8338,39.804Z"
					className="fill-current"
				></path>
			</svg>
		</div>
	)
}

export function LogoCircle({ className }: { className?: string }) {
	return (
		<>
			<svg
				className={cn('xs:size-16 absolute size-12 cursor-pointer', className)}
				viewBox="0 0 56 56"
			>
				<circle cx="28" cy="28" r="28" className="fill-primary" />
			</svg>
			<img
				src="https://res.cloudinary.com/arpitdalal-dev/image/upload/w_120,h_120/v1714157047/arpitdalal-dev/shadow_v2njin.png"
				alt="Shadow"
				className="xs:size-16 absolute size-12 cursor-pointer"
			/>
		</>
	)
}

export function LogoImage({ className }: { className?: string }) {
	return (
		<img
			src="https://res.cloudinary.com/arpitdalal-dev/image/upload/w_120,h_120/v1713461933/arpitdalal-dev/arpit-logo-rounded_chwr4o.webp"
			alt="Arpit Dalal Logo"
			className={cn(
				'xs:size-[60px] relative bottom-[2px] size-[44px] cursor-pointer rounded-full select-none',
				className,
			)}
		/>
	)
}
