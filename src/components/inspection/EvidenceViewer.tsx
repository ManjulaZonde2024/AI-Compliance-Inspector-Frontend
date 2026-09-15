import { useState } from 'react'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import type { FindingSeverity, InspectionEvidence } from '../../types'

const severityTone: Record<FindingSeverity, 'danger' | 'warning' | 'info'> = { high: 'danger', medium: 'warning', low: 'info' }
const severityLabels: Record<FindingSeverity, string> = { high: 'High', medium: 'Medium', low: 'Low' }

type EvidenceViewerProps = {
  evidence: InspectionEvidence
  severity?: FindingSeverity
  position?: { current: number; total: number }
}

export function EvidenceViewer({ evidence, severity, position }: EvidenceViewerProps) {
  const [zoom, setZoom] = useState(1)
  const box = evidence.boundingBox

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-muted">{position ? `Evidence ${position.current} of ${position.total}` : 'Evidence item'}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-ink">{evidence.title}</h2>
            {severity ? <Badge tone={severityTone[severity]}>{severityLabels[severity]} severity</Badge> : null}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 sm:mt-0">
          <button type="button" className="h-8 w-8 rounded-md border border-border text-lg text-ink hover:bg-bg" aria-label="Zoom out" onClick={() => setZoom((value) => Math.max(1, value - 0.25))}>−</button>
          <span className="w-12 text-center text-xs font-medium text-muted">{Math.round(zoom * 100)}%</span>
          <button type="button" className="h-8 w-8 rounded-md border border-border text-lg text-ink hover:bg-bg" aria-label="Zoom in" onClick={() => setZoom((value) => Math.min(2, value + 0.25))}>+</button>
        </div>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)]">
        <div className="space-y-3">
          <div className="relative flex min-h-[20rem] items-center justify-center overflow-auto rounded-md border border-border bg-slate-100 p-3">
            <div className="relative inline-block transition-transform duration-200" style={{ transform: `scale(${zoom})` }}>
              <img src={evidence.imageUrl} alt={evidence.imageAlt} className="block max-h-[34rem] max-w-full rounded object-contain" />
              {box ? <div className="status-pop pointer-events-none absolute border-2 border-danger bg-danger/15" style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.width}%`, height: `${box.height}%` }}><span className="absolute -top-6 left-0 whitespace-nowrap rounded bg-danger px-1.5 py-0.5 text-[10px] font-semibold text-white">Returned region</span></div> : null}
            </div>
          </div>
          <p className="text-xs text-muted">{box ? 'Original submitted image. The highlighted region marks the area returned for this finding.' : 'Original submitted image returned for this finding.'}</p>
          {evidence.cropUrl ? <div className="flex items-center gap-3 rounded-md border border-border bg-bg p-2"><img src={evidence.cropUrl} alt={`${evidence.title} evidence crop`} className="h-16 w-24 rounded object-cover" /><span className="text-xs text-muted">Evidence crop returned with this finding</span></div> : null}
        </div>
        <div className="space-y-4">
          <div className="rounded-md border border-danger/20 bg-danger/5 p-4"><div className="flex items-center gap-2"><span className="text-danger" aria-hidden="true">●</span><p className="text-sm font-semibold text-ink">What was detected</p></div><p className="mt-2 text-sm text-muted">{evidence.detectedValue ?? 'No detected value was returned.'}</p></div>
          <div className="rounded-md border border-border p-4"><p className="text-sm font-semibold text-ink">Expected value / requirement</p><p className="mt-2 text-sm text-muted">{evidence.expectedValue ?? 'No expected value was returned.'}</p></div>
          <div><p className="text-sm font-semibold text-ink">Why it matters</p><p className="mt-2 text-sm leading-6 text-muted">{evidence.explanation}</p></div>
          {evidence.reference ? <div className="border-t border-border pt-3"><p className="text-xs font-medium uppercase tracking-wide text-muted">Reference</p><Badge className="mt-2">{evidence.reference}</Badge></div> : null}
        </div>
      </div>
    </Card>
  )
}