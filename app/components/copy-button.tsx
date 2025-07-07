import { type VariantProps } from 'class-variance-authority'
import { useState } from 'react'
import { Button, type buttonVariants } from '#app/components/ui/button'
import { Icon } from '#app/components/ui/icon'
import { cn } from '#app/utils/misc'

type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>

interface CopyButtonProps {
	textToCopy: string
	text?: string
	className?: string
	startVariant?: ButtonVariant
	endVariant?: ButtonVariant
}

export function CopyButton({
	textToCopy,
	text,
	className,
	startVariant = 'secondary',
	endVariant = 'success',
}: CopyButtonProps) {
	const [isCopied, setIsCopied] = useState(false)

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(textToCopy)
			setIsCopied(true)

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
