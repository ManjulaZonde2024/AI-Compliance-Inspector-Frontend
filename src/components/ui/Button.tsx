import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

const variants = {
  primary:
    'bg-brand text-white shadow-md hover:-translate-y-px hover:bg-brand-dark hover:shadow-lg active:translate-y-0 active:scale-[0.98] focus-visible:outline-brand',
  secondary:
    'border border-border-strong/60 bg-surface text-ink shadow-sm hover:-translate-y-px hover:border-brand/40 hover:bg-surface-soft hover:shadow-md active:scale-[0.98] focus-visible:outline-brand',
  ghost: 'text-muted hover:bg-brand-light hover:text-ink active:scale-[0.98] focus-visible:outline-brand',
  danger: 'bg-danger text-white shadow-md hover:-translate-y-px hover:shadow-lg hover:brightness-95 active:scale-[0.98] focus-visible:outline-danger',
  onDark:
    'bg-white text-navy shadow-md hover:-translate-y-px hover:bg-accent-light hover:shadow-lg active:scale-[0.98] focus-visible:outline-white',
} as const

const sizes = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
} as const

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-[-0.006em] transition-[background-color,border-color,color,box-shadow,transform] duration-150 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
