import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

const variants = {
  primary:
    'bg-brand text-white shadow-sm hover:-translate-y-px hover:bg-brand-dark hover:shadow-md active:translate-y-0 active:scale-[0.98] focus-visible:outline-brand',
  secondary:
    'border border-border bg-surface text-ink shadow-sm hover:-translate-y-px hover:bg-bg hover:shadow-md active:scale-[0.98] focus-visible:outline-brand',
  ghost: 'text-ink hover:bg-brand-light active:scale-[0.98] focus-visible:outline-brand',
  danger: 'bg-danger text-white shadow-sm hover:-translate-y-px hover:bg-danger/90 hover:shadow-md active:scale-[0.98] focus-visible:outline-danger',
  onDark:
    'bg-white text-navy shadow-sm hover:-translate-y-px hover:bg-brand-light hover:shadow-md active:scale-[0.98] focus-visible:outline-white',
} as const

const sizes = {
  sm: 'h-8 px-3 text-sm',
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
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}
