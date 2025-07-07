import posthog from 'posthog-js'
import { useState } from 'react'
import { Button, type ButtonProps } from '#app/components/ui/button'
import { Icon } from '#app/components/ui/icon'
import { cn } from '#app/utils/misc'

interface CopyButtonProps {
	textToCopy: string
	text?: string
	title?: string
	className?: string
	startVariant?: ButtonProps['variant']
	endVariant?: ButtonProps['variant']
}

export function CopyButton({
	textToCopy,
	text,
	title,
	className,
	startVariant = 'secondary',
	endVariant = 'success',
}: CopyButtonProps) {
	const [isCopied, setIsCopied] = useState(false)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(textToCopy)
			setIsCopied(true)
			posthog.capture('copy_button_clicked', { event: `Copy ${title} URL` })

			setTimeout(() => {
				setIsCopied(false)
			}, 2000)
		} catch (error) {
			console.error('Failed to copy text:', error)
		}
	}

	return (
		<Button
			variant={isCopied ? endVariant : startVariant}
			className={cn('transition-all duration-400', className)}
			onClick={handleCopy}
			data-umami-event="copy-button-clicked"
			data-umami-event-title={title}
		>
			<Icon
				name={isCopied ? 'check-outline' : 'copy-outline'}
				className="size-4 transition-all duration-400"
			>
				{isCopied ? `Copied` : `Copy${text ? ` ${text}` : ''}`}
			</Icon>
		</Button>
	)
}
