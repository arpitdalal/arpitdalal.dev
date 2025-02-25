import { motion } from 'motion/react'
import { useState, useEffect } from 'react'
import { type Fetcher } from 'react-router'
import { Button } from '#app/components/ui/button'
import { Icon } from '#app/components/ui/icon'
import { cn } from '#app/utils/misc'

const Y_CHANGE = 30
type Status = 'success' | 'error'

interface SubmitButtonProps {
	state: Fetcher['state']
	data: { success?: boolean } | undefined
	text?: {
		default: string
		loading?: string
		success?: string
		error?: string
	}
	size?: 'icon' | 'full'
	className?: string
	dataProps?: Record<string, string>
	ariaProps?: Record<string, string>
}

export function SubmitButton({
	state,
	data,
	text = {
		default: 'Send Message',
		loading: 'Sending',
		success: 'Sent',
		error: 'Something went wrong',
	},
	size = 'full',
	className = '',
	dataProps = {},
	ariaProps = {},
}: SubmitButtonProps) {
	const [showStatus, setShowStatus] = useState<Status | null>(null)
	const isSubmitting = state !== 'idle'
	const isSuccess = !isSubmitting && data && data.success
	const isDisabled = isSubmitting || !!showStatus

	useEffect(() => {
		if (isSuccess === undefined || isSubmitting) return
		setShowStatus(isSuccess ? 'success' : !isSuccess ? 'error' : null)
		const timeout = setTimeout(() => {
			setShowStatus(null)
		}, 2000)
		return () => clearTimeout(timeout)
	}, [isSuccess, isSubmitting])

	return (
		<Button
			type="submit"
			className={cn(
				'group/submit overflow-hidden transition-all active:scale-95',
				size === 'icon' ? 'mt-[22px] rounded-l-none' : 'w-full sm:w-[300px]',
				isSubmitting && 'cursor-progress',
				!!showStatus && 'cursor-not-allowed',
				isDisabled && 'brightness-50',
				className,
			)}
			variant={
				showStatus === 'success'
					? 'success'
					: showStatus === 'error'
						? 'destructive'
						: 'default'
			}
			size={size === 'icon' ? 'icon' : 'default'}
			onClick={(event) => {
				if (isDisabled) {
					return event.preventDefault()
				}
			}}
			{...dataProps}
			{...ariaProps}
		>
			<div className="relative flex h-7 w-full items-center justify-center">
				<motion.div
					initial={false}
					animate={{
						y: isSubmitting ? Y_CHANGE : showStatus ? Y_CHANGE : 0,
						opacity: isSubmitting || showStatus ? 0 : 1,
					}}
					transition={{ duration: 0.2 }}
					className="absolute inset-x-0 flex items-center justify-center gap-2"
				>
					{size === 'full' && <span>{text.default}</span>}
					<Icon
						name="arrow-right-outline"
						className="motion-safe:group-hover/submit:animate-bounce-right size-4"
					/>
				</motion.div>

				<motion.div
					initial={{ y: -Y_CHANGE, opacity: 0 }}
					animate={{
						y: isSubmitting ? 0 : -Y_CHANGE,
						opacity: isSubmitting ? 1 : 0,
					}}
					transition={{ duration: 0.2 }}
					className="absolute inset-x-0 flex items-center justify-center gap-2"
				>
					{size === 'full' && <span>{text.loading}</span>}
					<Icon
						name="refresh-outline"
						className="size-4 motion-safe:animate-spin"
					/>
				</motion.div>

				<motion.div
					initial={{ y: -Y_CHANGE, opacity: 0 }}
					animate={{
						y: showStatus ? 0 : -Y_CHANGE,
						opacity: showStatus ? 1 : 0,
					}}
					transition={{ duration: 0.2 }}
					className="absolute inset-x-0 flex items-center justify-center gap-2"
				>
					{size === 'full' && (
						<span>
							{showStatus === 'success'
								? text.success
								: showStatus === 'error'
									? text.error
									: text.loading}
						</span>
					)}
					<motion.span
						initial={false}
						animate={{
							scale: showStatus ? [0.5, 1] : 0.5,
						}}
						transition={{
							duration: 0.3,
							type: 'spring',
							stiffness: 400,
							damping: 10,
						}}
					>
						<Icon
							name={showStatus === 'success' ? 'check-outline' : 'x-outline'}
							className="size-4"
						/>
					</motion.span>
				</motion.div>
			</div>
		</Button>
	)
}
