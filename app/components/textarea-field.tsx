import { useId } from 'react'
import { ErrorList, type ListOfErrors } from './error-list'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'

export function TextareaField({
	labelProps,
	textareaProps: { key, ...textareaProps },
	errors,
	className,
}: {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	textareaProps: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
		key?: React.Key
	}
	errors?: ListOfErrors
	className?: string
}) {
	const fallbackId = useId()
	const id = textareaProps.id ?? textareaProps.name ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined
	const isRequired = textareaProps.required

	return (
		<div className={className}>
			<div className="flex items-start gap-1 pb-2">
				<Label {...labelProps} htmlFor={id} />
				{isRequired ? (
					<span className="text-sm leading-none">
						<span className="text-foreground-destructive">*</span>
						<span className="sr-only">Required</span>
					</span>
				) : null}
			</div>
			<Textarea
				key={key}
				id={id}
				aria-invalid={errorId ? true : undefined}
				aria-describedby={errorId}
				className="resize-y"
				{...textareaProps}
			/>
			<div className="min-h-[32px] pb-3 pt-1">
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</div>
	)
}
