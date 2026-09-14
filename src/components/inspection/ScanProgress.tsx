import type { ScanStage } from '../../types'

type ScanProgressProps = { stages: ScanStage[] }

const statePresentation = {
  pending: { icon: '○', label: 'Pending', className: 'border-border bg-bg text-muted' },
  active: { icon: '◌', label: 'In progress', className: 'border-brand/30 bg-brand-light text-brand shadow-sm' },
  completed: { icon: '✓', label: 'Completed', className: 'border-success/25 bg-success/10 text-success' },
  failed: { icon: '!', label: 'Needs attention', className: 'border-danger/25 bg-danger/10 text-danger' },
} as const

export function ScanProgress({ stages }: ScanProgressProps) {
  const completed = stages.filter((stage) => stage.state === 'completed').length
  const active = stages.find((stage) => stage.state === 'active')

  return <section aria-labelledby="scan-progress-heading">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><h2 id="scan-progress-heading" className="font-semibold tracking-tight text-ink">Analysis workflow</h2><p className="mt-1 text-sm text-muted">{active ? `${active.label} is in progress.` : `${completed} of ${stages.length} workflow stages complete.`}</p></div><p className="text-sm font-medium text-muted">{completed} of {stages.length} complete</p></div>
    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-border" role="progressbar" aria-label="Inspection analysis progress" aria-valuemin={0} aria-valuemax={stages.length} aria-valuenow={completed}><div className="h-full rounded-full bg-brand transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${(completed / stages.length) * 100}%` }} /></div>
    <ol className="mt-5 space-y-3">
      {stages.map((stage) => {
        const presentation = statePresentation[stage.state]
        return <li key={stage.key} className={`flex items-start gap-3 rounded-lg border px-3 py-3 transition-colors ${presentation.className}`}>
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${stage.state === 'active' ? 'animate-pulse motion-reduce:animate-none' : stage.state === 'completed' ? 'status-pop' : ''}`} aria-hidden>{presentation.icon}</span>
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h3 className="text-sm font-semibold text-ink">{stage.label}</h3><span className="text-xs font-medium">{presentation.label}</span></div><p className="mt-0.5 text-sm text-muted">{stage.description}</p></div>
        </li>
      })}
    </ol>
  </section>
}
