import type { HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

const tones = {
  default: 'border-border bg-surface-soft text-muted',
  brand: 'border-brand/25 bg-brand-light text-brand-dark dark:text-brand',
  success: 'border-success/25 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  danger: 'border-danger/25 bg-danger/10 text-danger',
  info: 'border-info/25 bg-info/10 text-info',
} as const

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: keyof typeof tones
}

export function Badge({ className, tone = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-[-0.004em] transition-[background-color,border-color,color,box-shadow] duration-150',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
