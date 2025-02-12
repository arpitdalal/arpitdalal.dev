export function LineGlow() {
	return (
		<div className="relative h-32 overflow-hidden" aria-hidden>
			<div className="absolute -top-[100px] left-0 right-0 h-56 opacity-40 dark:opacity-20">
				<div className="bg-gradient-radial h-36 from-violet-600 blur-2xl"></div>
			</div>
			<div className="h-px bg-gradient-to-r from-transparent from-30% via-violet-400 to-transparent to-70% opacity-50 dark:via-violet-600"></div>
		</div>
	)
}
