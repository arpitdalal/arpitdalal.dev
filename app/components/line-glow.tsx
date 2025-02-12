export function LineGlow() {
	return (
		<div className="relative h-32 overflow-hidden" aria-hidden>
			<div className="absolute -top-[100px] right-0 left-0 h-56 opacity-40 dark:opacity-20">
				<div className="h-36 bg-radial from-violet-600 blur-2xl"></div>
			</div>
			<div className="h-px bg-linear-to-r from-transparent from-30% via-violet-400 to-transparent to-70% opacity-50 dark:via-violet-600"></div>
		</div>
	)
}
