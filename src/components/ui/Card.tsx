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
        'rounded-lg border border-border bg-surface p-5 shadow-md',
        className,
      )}
      {...props}
    >
      {title ? (
        <h2 className="text-base font-semibold tracking-tight text-ink">
          {title}
        </h2>
      ) : null}
      {description ? (
        <p className={cn('text-sm text-muted', title && 'mt-1')}>{description}</p>
      ) : null}
      {children ? (
        <div className={cn((title || description) && 'mt-4')}>{children}</div>
      ) : null}
    </section>
  )
}
