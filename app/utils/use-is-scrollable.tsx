import { useEffect, useState } from 'react'

export function useIsScrollable() {
	const [isScrollable, setIsScrollable] = useState(false)

	useEffect(() => {
		const checkIfScrollable = () => {
			const isPageScrollable =
				document.documentElement.scrollHeight > window.innerHeight
			setIsScrollable(isPageScrollable)
		}

		checkIfScrollable()
		window.addEventListener('resize', checkIfScrollable)

		return () => window.removeEventListener('resize', checkIfScrollable)
	}, [])

	return isScrollable
}
