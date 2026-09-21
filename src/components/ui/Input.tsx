import { useId, type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export function Input({
  className,
  label,
  error,
  id,
  ...props
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <label htmlFor={inputId} className="text-[13px] font-semibold text-ink">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        className={cn(
          'h-10 w-full rounded-lg border bg-surface px-3 text-sm text-ink shadow-sm placeholder:text-muted/80',
          'border-border-strong/50 transition-[border-color,box-shadow,background-color] hover:border-brand/45',
          'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand',
          'disabled:cursor-not-allowed disabled:bg-surface-soft disabled:opacity-60',
          error && 'border-danger',
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}
