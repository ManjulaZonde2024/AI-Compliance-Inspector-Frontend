import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ScanProgress } from '../components/inspection/ScanProgress'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LoadingState, Skeleton } from '../components/ui/LoadingState'
import { scanService } from '../services'
import type { ScanInspectionContext, ScanSnapshot } from '../types'

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

  if (!snapshot && !loadFailed) return <div className="space-y-6"><LoadingState label="Preparing inspection workspace" /><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]"><Skeleton className="h-[34rem]" /><Skeleton className="h-56" /></div></div>
  if (!snapshot || loadFailed) return <Card className="py-12 text-center"><p className="text-base font-semibold text-ink">Inspection workspace could not be loaded</p><p className="mt-1 text-sm text-muted">Please try again to continue with this inspection.</p><Button className="mt-5" variant="secondary" onClick={startScan}>Try again</Button></Card>

  const imageCount = snapshot.context.images.length
  const activeStage = snapshot.stages.find((stage) => stage.state === 'active')
  const isProcessing = snapshot.status === 'processing'
  return <>
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-mono text-xs text-muted">{snapshot.inspectionId}</p><h1 className="mt-1 text-xl font-semibold tracking-tight text-ink md:text-2xl">{snapshot.context.productName}</h1><p className="mt-1 text-sm text-muted">{snapshot.context.category || 'Product category not specified'} · {imageCount} submitted image{imageCount === 1 ? '' : 's'}</p></div><Badge tone={snapshot.status === 'failed' ? 'danger' : snapshot.status === 'completed' ? 'success' : 'info'}>{snapshot.status === 'failed' ? 'Scan needs attention' : snapshot.status === 'completed' ? 'Scan complete' : 'Analysis in progress'}</Badge></header>
    {snapshot.status === 'completed' ? <div className="mb-6 rounded-lg border border-success/25 bg-success/10 px-4 py-3 text-sm text-success" role="status">Analysis workflow complete. Opening the inspection result…</div> : null}
    {snapshot.status === 'failed' ? <div className="mb-6 rounded-lg border border-danger/25 bg-danger/5 px-4 py-3" role="alert"><p className="font-medium text-danger">Inspection could not be completed</p><p className="mt-1 text-sm text-muted">{snapshot.errorMessage}</p><div className="mt-4 flex flex-wrap gap-2"><Button onClick={() => scanService.retryScan(snapshot).then(setSnapshot, () => setLoadFailed(true))}>Retry analysis</Button><Button variant="secondary" onClick={() => navigate('/inspections/new')}>Start another inspection</Button></div></div> : null}
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]"><Card className="p-5 sm:p-6"><div className={`relative overflow-hidden rounded-xl border p-4 ${isProcessing ? 'border-brand/25 bg-brand-light/60' : 'border-border bg-bg/80'}`}><div className={`relative flex items-start gap-3 ${isProcessing ? '' : 'opacity-80'}`}><span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${isProcessing ? 'bg-brand' : 'bg-slate-500'} ${isProcessing ? 'animate-pulse motion-reduce:animate-none' : 'status-pop'}`} aria-hidden>◌</span><div><p className="text-sm font-semibold text-ink">{activeStage ? activeStage.label : snapshot.status === 'completed' ? 'Analysis complete' : 'Analysis paused'}</p><p className="mt-0.5 text-sm text-muted">{activeStage?.description ?? 'The inspection workflow is ready for the next step.'}</p></div></div></div>{imageCount ? <div className="mt-6 rounded-xl border border-border bg-slate-50 p-3"><div className="relative overflow-hidden rounded-lg border border-border bg-white p-3"><div className={`pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-brand/10 ${isProcessing ? 'scan-line' : 'hidden'}`} aria-hidden /><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{snapshot.context.images.slice(0, 4).map((image, index) => <div key={`${image.previewUrl}-${index}`} className="overflow-hidden rounded-lg border border-border bg-bg"><img src={image.previewUrl} alt={`${image.role} product view`} className="h-24 w-full object-cover" /><p className="px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-muted">{image.role}</p></div>)}</div></div></div> : null}<div className="mt-6"><ScanProgress stages={snapshot.stages} /></div></Card>
      <aside className="space-y-4"><Card title="Inspection context"><dl className="space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-muted">Inspection</dt><dd className="font-mono text-xs text-ink">{snapshot.inspectionId}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted">Images</dt><dd className="font-medium text-ink">{imageCount} submitted</dd></div><div className="flex justify-between gap-4"><dt className="text-muted">Workflow</dt><dd className="font-medium text-ink">{snapshot.status === 'processing' ? 'In progress' : snapshot.status}</dd></div></dl></Card>
      <Card title="Submitted images" description={imageCount ? 'Source views included in this inspection.' : 'Image previews are unavailable for this inspection.'}>{imageCount ? <ul className="mt-1 flex gap-2 overflow-x-auto pb-1">{snapshot.context.images.slice(0, 4).map((image, index) => <li key={`${image.previewUrl}-${index}`} className="w-20 shrink-0"><img src={image.previewUrl} alt={`${image.role} product view`} className="h-20 w-20 rounded-md border border-border object-cover" /><p className="mt-1 text-center text-xs capitalize text-muted">{image.role}</p></li>)}</ul> : <p className="text-sm text-muted">No preview files were carried into this workspace.</p>}</Card></aside>
    </div>
  </>
}
