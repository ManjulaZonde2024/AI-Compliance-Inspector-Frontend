import { cn } from '../../utils/cn'

type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton-shimmer rounded-md bg-border', className)}
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
      className="flex items-center gap-3 text-sm text-muted"
    >
      <Skeleton className="h-4 w-24" />
      <span>{label}</span>
    </div>
  )
}
