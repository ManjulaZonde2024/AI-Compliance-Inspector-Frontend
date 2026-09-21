import { cn } from '../../utils/cn'

type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton-shimmer rounded-lg bg-border/70', className)}
      aria-hidden
    />
  )
}

type LoadingStateProps = {
  label?: string
}

export function LoadingState({ label = 'Loading' }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 text-[13px] text-muted"
    >
      <Skeleton className="h-4 w-24" />
      <span>{label}</span>
    </div>
  )
}
