import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

const tones = {
  default: 'border-border bg-bg text-muted',
  brand: 'border-transparent bg-brand-light text-brand',
  success: 'border-transparent bg-success/10 text-success',
  warning: 'border-transparent bg-warning/10 text-warning',
  danger: 'border-transparent bg-danger/10 text-danger',
  info: 'border-transparent bg-info/10 text-info',
} as const

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: keyof typeof tones
}

export function Badge({ className, tone = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-[background-color,border-color,color,box-shadow] duration-150',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
