import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  title?: string
  description?: string
  children?: ReactNode
}

export function Card({
  className,
  title,
  description,
  children,
  ...props
}: CardProps) {
  return (
    <section
      className={cn(
        'rounded-xl border border-border bg-surface p-5 shadow-md transition-[border-color,box-shadow,background-color] duration-200 sm:p-6',
        className,
      )}
      {...props}
    >
      {title ? (
        <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          {title}
        </h2>
      ) : null}
      {description ? (
        <p className={cn('text-[13px] leading-5 text-muted', title && 'mt-1')}>{description}</p>
      ) : null}
      {children ? (
        <div className={cn((title || description) && 'mt-4')}>{children}</div>
      ) : null}
    </section>
  )
}
