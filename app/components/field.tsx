import { useId } from 'react'
import { ErrorList, type ListOfErrors } from './error-list'
import { Input } from './ui/input'
import { Label } from './ui/label'

type FieldProps = {
	labelProps: React.LabelHTMLAttributes<HTMLLabelElement>
	inputProps: React.InputHTMLAttributes<HTMLInputElement> & { key?: React.Key }
	errors?: ListOfErrors
	className?: string
}
export function Field({
	labelProps,
	inputProps: { key, ...inputProps },
	errors,
	className,
}: FieldProps) {
	const fallbackId = useId()
	const id = inputProps.id ?? fallbackId
	const errorId = errors?.length ? `${id}-error` : undefined
	const isRequired = inputProps.required

	return (
		<div className={className}>
			<div className="flex items-start gap-1 pb-2">
				<Label htmlFor={id} {...labelProps} />
				{isRequired ? (
					<span className="text-sm leading-none">
						<span className="text-foreground-destructive">*</span>
						<span className="sr-only">Required</span>
					</span>
				) : null}
			</div>
			<Input
				key={key}
				id={id}
				aria-invalid={errorId ? true : undefined}
				aria-describedby={errorId}
				{...inputProps}
			/>
			<div className="min-h-[32px] pb-3 pt-1">
				{errorId ? <ErrorList id={errorId} errors={errors} /> : null}
			</div>
		</div>
	)
}
