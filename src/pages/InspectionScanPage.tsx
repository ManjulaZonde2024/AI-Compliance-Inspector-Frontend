import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LoadingState, Skeleton } from '../components/ui/LoadingState'
import { scanService } from '../services'
import type { ScanInspectionContext, ScanSnapshot, ScanStageState } from '../types'
import { cn } from '../utils/cn'

type StagePresentation = {
  icon: string
  stateLabel: string
  marker: string
  stateText: string
}

const stagePresentation: Record<ScanStageState, StagePresentation> = {
  pending: { icon: '', stateLabel: 'Pending', marker: 'border-border bg-surface text-muted', stateText: 'text-muted' },
  active: { icon: '●', stateLabel: 'In progress', marker: 'border-brand bg-brand text-white', stateText: 'text-brand' },
  completed: { icon: '✓', stateLabel: 'Completed', marker: 'border-success/25 bg-success/10 text-success', stateText: 'text-success' },
  failed: { icon: '!', stateLabel: 'Needs attention', marker: 'border-danger/30 bg-danger/10 text-danger', stateText: 'text-danger' },
}

export function InspectionScanPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [snapshot, setSnapshot] = useState<ScanSnapshot | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const context = location.state as ScanInspectionContext | null

  const startScan = () => {
    if (!id) return
    setLoadFailed(false)
    setSnapshot(null)
    scanService.getInitialScan(id, context ?? undefined).then(setSnapshot, () => setLoadFailed(true))
  }

  useEffect(() => {
    if (!id) return
    scanService.getInitialScan(id, context ?? undefined).then(setSnapshot, () => setLoadFailed(true))
  }, [context, id])

  useEffect(() => {
    if (!snapshot || snapshot.status !== 'processing') return
    const timer = window.setTimeout(() => scanService.advanceScan(snapshot).then(setSnapshot, () => setLoadFailed(true)), 950)
    return () => window.clearTimeout(timer)
  }, [snapshot])

  useEffect(() => {
    if (snapshot?.status !== 'completed') return
    const timer = window.setTimeout(() => navigate(`/inspections/${snapshot.inspectionId}/result`), 650)
    return () => window.clearTimeout(timer)
  }, [navigate, snapshot])

  if (!snapshot && !loadFailed) {
    return (
      <div className="space-y-6">
        <LoadingState label="Preparing inspection workspace" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
          <div className="space-y-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-[30rem]" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-52" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    )
  }
  if (!snapshot || loadFailed) return <Card className="py-12 text-center"><p className="text-base font-semibold text-ink">Inspection workspace could not be loaded</p><p className="mt-1 text-sm text-muted">Please try again to continue with this inspection.</p><Button className="mt-5" variant="secondary" onClick={startScan}>Try again</Button></Card>

  const imageCount = snapshot.context.images.length
  const stages = snapshot.stages
  const totalStages = stages.length
  const completedCount = stages.filter((stage) => stage.state === 'completed').length
  const percent = totalStages ? Math.round((completedCount / totalStages) * 100) : 0
  const activeStage = stages.find((stage) => stage.state === 'active')
  const failedStage = stages.find((stage) => stage.state === 'failed')
  const activeStageIndex = activeStage ? stages.indexOf(activeStage) : -1
  const isProcessing = snapshot.status === 'processing'
  const isCompleted = snapshot.status === 'completed'
  const isFailed = snapshot.status === 'failed'
  const statusLabel = isFailed ? 'Scan needs attention' : isCompleted ? 'Scan complete' : 'Analysis in progress'
  return <>
    <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        <p className="font-mono text-xs text-muted">{snapshot.inspectionId}</p>
        <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-ink md:text-2xl">{snapshot.context.productName}</h1>
        <p className="mt-1 text-sm text-muted">
          {snapshot.context.category || 'Product category not specified'} · {imageCount} submitted image{imageCount === 1 ? '' : 's'}
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Submitted product views are processed through a fixed sequence of automated compliance checks. Progress updates automatically while the scan runs.
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-4 lg:pt-1">
        <p className="hidden text-right sm:block">
          <span className="block text-sm font-semibold leading-tight tabular-nums text-ink">{completedCount}/{totalStages}</span>
          <span className="block text-xs text-muted">stages complete</span>
        </p>
        <Badge tone={isFailed ? 'danger' : isCompleted ? 'success' : 'info'}>
          {isProcessing ? <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current animate-pulse motion-reduce:animate-none" aria-hidden /> : null}
          {statusLabel}
        </Badge>
      </div>
    </header>
    {snapshot.status === 'completed' ? (
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-success/25 bg-success/10 px-4 py-3" role="status">
        <span className="status-pop flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success text-xs font-semibold text-white" aria-hidden>✓</span>
        <p className="text-sm text-success"><span className="font-semibold">Analysis workflow complete.</span> Opening the inspection result…</p>
      </div>
    ) : null}
    {snapshot.status === 'failed' ? <div className="mb-6 rounded-lg border border-danger/25 bg-danger/5 px-4 py-3" role="alert"><p className="font-medium text-danger">Inspection could not be completed</p><p className="mt-1 text-sm text-muted">{snapshot.errorMessage}</p><div className="mt-4 flex flex-wrap gap-2"><Button onClick={() => scanService.retryScan(snapshot).then(setSnapshot, () => setLoadFailed(true))}>Retry analysis</Button><Button variant="secondary" onClick={() => navigate('/inspections/new')}>Start another inspection</Button></div></div> : null}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
      <Card className="p-5 sm:p-6" aria-label="Inspection scan progress">
        <section aria-label="Overall progress">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Overall progress</p>
              <p className="mt-1 truncate text-sm text-muted">
                {isCompleted ? 'All workflow stages complete' : activeStage ? `Current step: ${activeStage.label}` : 'Waiting for the workflow to start'}
              </p>
            </div>
            <p className="shrink-0 text-right">
              <span className="text-xl font-semibold leading-none tabular-nums text-ink">{percent}%</span>
              <span className="mt-1 block text-xs text-muted">{completedCount} of {totalStages} stages</span>
            </p>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-border"
            role="progressbar"
            aria-label="Inspection analysis progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div
              className={cn('h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none', isCompleted ? 'bg-success' : 'bg-brand')}
              style={{ width: `${percent}%` }}
            />
          </div>
        </section>
        <section
          className={cn(
            'mt-6 rounded-lg border p-4 sm:p-5',
            isProcessing ? 'border-brand/30 bg-brand-light/70' : isFailed ? 'border-danger/25 bg-danger/5' : 'border-success/25 bg-success/5',
          )}
          aria-live="polite"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            {isProcessing ? (
              <span className="relative mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white" aria-hidden>
                <span className="absolute inset-0 rounded-full bg-brand opacity-30 animate-ping motion-reduce:animate-none" />
                <span className="relative">◌</span>
              </span>
            ) : (
              <span className={cn('status-pop mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white', isCompleted ? 'bg-success' : 'bg-danger')} aria-hidden>
                {isCompleted ? '✓' : '!'}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className={cn('text-[11px] font-semibold uppercase tracking-[0.14em]', isProcessing ? 'text-brand' : isFailed ? 'text-danger' : 'text-success')}>
                  {isProcessing ? `Now running · Step ${activeStageIndex + 1} of ${totalStages}` : isCompleted ? 'All checks complete' : 'Workflow stopped'}
                </p>
                {isProcessing ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-brand/30 bg-surface px-2 py-0.5 text-xs font-medium text-brand">
                    In progress
                    <span className="inline-flex items-center gap-0.5" aria-hidden>
                      <span className="h-1 w-1 rounded-full bg-brand animate-pulse motion-reduce:animate-none" />
                      <span className="h-1 w-1 rounded-full bg-brand animate-pulse motion-reduce:animate-none [animation-delay:200ms]" />
                      <span className="h-1 w-1 rounded-full bg-brand animate-pulse motion-reduce:animate-none [animation-delay:400ms]" />
                    </span>
                  </span>
                ) : null}
              </div>
              <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-ink">
                {activeStage ? activeStage.label : isCompleted ? 'Analysis complete' : failedStage ? failedStage.label : 'Analysis paused'}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                {activeStage
                  ? activeStage.description
                  : isCompleted
                    ? 'The full workflow finished successfully. Opening the inspection result…'
                    : failedStage
                      ? failedStage.description
                      : 'The inspection workflow is ready for the next step.'}
              </p>
            </div>
          </div>
        </section>
        <section className="mt-6" aria-labelledby="scan-workflow-heading">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id="scan-workflow-heading" className="text-base font-semibold tracking-tight text-ink">Analysis workflow</h2>
            <p className="text-xs text-muted">{totalStages} sequential stages</p>
          </div>
          <ol className="mt-4">
            {stages.map((stage, index) => {
              const presentation = stagePresentation[stage.state]
              const isStageActive = stage.state === 'active'
              const isLastStage = index === totalStages - 1
              return (
                <li key={stage.key} className="flex gap-3">
                  <div className="flex w-7 shrink-0 flex-col items-center">
                    <span className={cn('relative flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold', presentation.marker)}>
                      {isStageActive ? <span className="absolute inset-0 rounded-full bg-brand opacity-30 animate-ping motion-reduce:animate-none" aria-hidden /> : null}
                      <span className={cn('relative', stage.state === 'completed' && 'status-pop')} aria-hidden>
                        {stage.state === 'pending' ? index + 1 : presentation.icon}
                      </span>
                    </span>
                    {!isLastStage ? <span className="mt-1 w-px flex-1 bg-border" aria-hidden /> : null}
                  </div>
                  <div className={cn('min-w-0 flex-1 rounded-lg border px-3 py-2.5', isStageActive ? 'border-brand/30 bg-brand-light/70 shadow-sm' : 'border-transparent', !isLastStage && 'mb-4')}>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h3 className={cn('text-sm', stage.state === 'pending' ? 'font-medium text-muted' : 'font-semibold text-ink')}>{stage.label}</h3>
                      <span className={cn('text-xs font-medium', presentation.stateText)}>{presentation.stateLabel}</span>
                    </div>
                    <p className="mt-0.5 text-sm leading-6 text-muted">{stage.description}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
        {imageCount ? (
          <section className="mt-6" aria-labelledby="scan-images-heading">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="scan-images-heading" className="text-sm font-semibold text-ink">Submitted images</h2>
              <p className="text-xs text-muted">{imageCount > 4 ? `Showing first 4 of ${imageCount}` : `${imageCount} submitted`}</p>
            </div>
            <div className="relative mt-3 overflow-hidden rounded-lg border border-border bg-slate-50 p-3">
              <div className={cn('pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-brand/10', isProcessing ? 'scan-line' : 'hidden')} aria-hidden />
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {snapshot.context.images.slice(0, 4).map((image, index) => (
                  <li key={`${image.previewUrl}-${index}`} className="overflow-hidden rounded-md border border-border bg-bg">
                    <img src={image.previewUrl} alt={`${image.role} product view`} className="h-24 w-full object-cover" />
                    <p className="truncate px-2 py-1.5 text-[11px] uppercase tracking-[0.14em] text-muted">{image.role}</p>
                  </li>
                ))}
                {imageCount > 4 ? (
                  <li className="flex items-center justify-center rounded-md border border-dashed border-border text-xs font-medium text-muted">
                    +{imageCount - 4} more
                  </li>
                ) : null}
              </ul>
            </div>
          </section>
        ) : null}
      </Card>
      <aside className="space-y-4">
        <Card title="Inspection context">
          <dl className="divide-y divide-border text-sm">
            <div className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
              <dt className="shrink-0 text-muted">Inspection</dt>
              <dd className="break-all text-right font-mono text-xs text-ink">{snapshot.inspectionId}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
              <dt className="shrink-0 text-muted">Product</dt>
              <dd className="min-w-0 text-right font-medium text-ink">{snapshot.context.productName}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
              <dt className="shrink-0 text-muted">Category</dt>
              <dd className="text-right font-medium text-ink">{snapshot.context.category || 'Not specified'}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
              <dt className="shrink-0 text-muted">Images</dt>
              <dd className="text-right font-medium text-ink">{imageCount} submitted</dd>
            </div>
            {snapshot.attempt > 1 ? (
              <div className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                <dt className="shrink-0 text-muted">Attempt</dt>
                <dd className="text-right font-medium text-ink">#{snapshot.attempt}</dd>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
              <dt className="shrink-0 text-muted">Workflow</dt>
              <dd className="text-right font-medium text-ink">{isProcessing ? 'In progress' : isCompleted ? 'Complete' : 'Failed'}</dd>
            </div>
          </dl>
        </Card>
        <Card title="Submitted images" description={imageCount ? 'Source views included in this inspection.' : 'Image previews are unavailable for this inspection.'}>
          {imageCount ? (
            <ul className="flex flex-wrap gap-2.5">
              {snapshot.context.images.slice(0, 4).map((image, index) => (
                <li key={`${image.previewUrl}-${index}`} className="w-20">
                  <img src={image.previewUrl} alt={`${image.role} product view`} className="h-20 w-20 rounded-md border border-border object-cover" />
                  <p className="mt-1 text-center text-xs capitalize text-muted">{image.role}</p>
                </li>
              ))}
              {imageCount > 4 ? (
                <li className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-border text-xs font-medium text-muted" aria-label={`${imageCount - 4} more images not previewed`}>
                  +{imageCount - 4}
                </li>
              ) : null}
            </ul>
          ) : (
            <p className="text-sm text-muted">No preview files were carried into this workspace.</p>
          )}
        </Card>
      </aside>
    </div>
  </>
}
