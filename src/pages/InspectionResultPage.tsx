  import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LoadingState, Skeleton } from '../components/ui/LoadingState'
import { resultService } from '../services'
import type { ComplianceStatus, InspectionFinding, InspectionResult } from '../types'

const statusDetails: Record<ComplianceStatus, { label: string; tone: 'success' | 'danger'; marker: string }> = { compliant: { label: 'Compliant', tone: 'success', marker: 'OK' }, 'non-compliant': { label: 'Non-compliant', tone: 'danger', marker: '!' } }
const severityDetails = { high: { label: 'High', tone: 'danger' as const, marker: '!' }, medium: { label: 'Medium', tone: 'warning' as const, marker: '!' }, low: { label: 'Low', tone: 'info' as const, marker: 'i' } }

function formatInspectedAt(value?: string) {
  return value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not returned'
}

function ScoreGauge({ score, tone }: { score: number; tone: 'success' | 'danger' }) {
  const clamped = Math.min(100, Math.max(0, score))
  const barTone = tone === 'danger' ? 'bg-danger' : 'bg-success'
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Compliance score</p>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-5xl font-semibold leading-none tracking-tight tabular-nums text-ink">{score}</span>
        <span className="text-lg font-medium text-muted">/100</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/5" role="presentation">
        <div className={`h-full rounded-full ${barTone}`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}

function FindingCard({ finding, onEvidence }: { finding: InspectionFinding; onEvidence: () => void }) {
  const severity = severityDetails[finding.severity]
  const markerTone = severity.tone === 'danger' ? 'bg-danger/10 text-danger' : severity.tone === 'warning' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'
  return (
    <article className="finding-enter rounded-lg border border-border bg-surface p-4 transition-[border-color,box-shadow,transform] duration-150 hover:border-brand/25 hover:shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${markerTone}`} aria-hidden="true">{severity.marker}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <h3 className="text-base font-semibold leading-snug tracking-tight text-ink">{finding.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted">{finding.explanation}</p>
            </div>
            <Badge tone={severity.tone}>{severity.label} severity</Badge>
          </div>
          {finding.detectedValue || finding.expectedValue ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {finding.detectedValue ? (
                <div className="rounded-md border border-border bg-bg/60 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Detected</p>
                  <p className="mt-1 text-sm leading-snug text-ink">{finding.detectedValue}</p>
                </div>
              ) : null}
              {finding.expectedValue ? (
                <div className="rounded-md border border-border bg-bg/60 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Expected</p>
                  <p className="mt-1 text-sm leading-snug text-ink">{finding.expectedValue}</p>
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {finding.reference ? <span className="text-xs text-muted">Reference: {finding.reference}</span> : null}
            {finding.evidenceId ? (
              <Button size="sm" variant="secondary" onClick={onEvidence}>Review evidence <span aria-hidden="true">→</span></Button>
            ) : (
              <span className="text-xs text-muted">No supporting evidence returned</span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export function InspectionResultPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState<InspectionResult | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => { if (id) resultService.getResult(id).then(setResult, () => setFailed(true)) }, [id])

  if (!result && !failed) return <div className="space-y-6"><LoadingState label="Loading inspection result" /><Skeleton className="h-44" /><Skeleton className="h-96" /></div>
  if (failed || !result) return <Card className="py-14 text-center"><p className="font-semibold text-ink">Result could not be loaded</p><p className="mt-1 text-sm text-muted">The inspection result is unavailable right now. Please return to the dashboard and try again.</p><Button className="mt-5" variant="secondary" onClick={() => navigate('/dashboard')}>Back to dashboard</Button></Card>

  const status = statusDetails[result.status]
  const highCount = result.findings.filter((finding) => finding.severity === 'high').length
  const evidencePath = `/inspections/${result.inspectionId}/evidence`
  return <div><div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between"><div><p className="font-mono text-xs text-muted">{result.inspectionId}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Inspection result</h1><p className="mt-1 text-sm text-muted">{result.productName}{result.category ? ` · ${result.category}` : ''}</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>Back to dashboard</Button><Button variant="secondary" size="sm" onClick={() => navigate(`/inspections/${result.inspectionId}/report`)}>View report</Button></div></div>
    <section className={`relative overflow-hidden rounded-lg border p-5 sm:p-6 ${result.status === 'non-compliant' ? 'border-danger/25 bg-danger/5' : 'border-success/25 bg-success/5'}`} aria-labelledby="outcome-heading"><span className={`pointer-events-none absolute inset-y-0 left-0 w-1 ${result.status === 'non-compliant' ? 'bg-danger' : 'bg-success'}`} aria-hidden="true" /><div className="flex flex-col gap-6 pl-3 lg:flex-row lg:items-center lg:justify-between lg:pl-4"><div className="flex items-start gap-4"><span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold shadow-sm ${result.status === 'non-compliant' ? 'bg-danger text-white' : 'bg-success text-white'}`} aria-hidden="true">{status.marker}</span><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Overall compliance status</p><h2 id="outcome-heading" className="mt-1.5 text-2xl font-semibold tracking-tight text-ink">{status.label}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{result.summary}</p></div></div><div className="shrink-0 lg:border-l lg:border-black/10 lg:pl-8">{result.score !== undefined ? <ScoreGauge score={result.score} tone={status.tone} /> : null}</div></div></section>
    <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface shadow-md"><div className="grid sm:grid-cols-3 sm:divide-x sm:divide-border"><div className="flex items-center gap-3 p-4 sm:p-5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-light text-sm font-semibold text-brand" aria-hidden="true">#</span><div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Total findings</p><p className="mt-1 text-2xl font-semibold leading-none tabular-nums text-ink">{result.findings.length}</p></div></div><div className="flex items-center gap-3 border-t border-border p-4 sm:border-t-0 sm:p-5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-danger/10 text-sm font-semibold text-danger" aria-hidden="true">!</span><div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">High severity</p><p className="mt-1 text-2xl font-semibold leading-none tabular-nums text-danger">{highCount}</p></div></div><div className="flex items-center gap-3 border-t border-border p-4 sm:border-t-0 sm:p-5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-info/10 text-sm font-semibold text-info" aria-hidden="true">◷</span><div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Inspection date</p><p className="mt-1 text-sm font-medium leading-none text-ink">{formatInspectedAt(result.inspectedAt)}</p></div></div></div></div>
    <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface shadow-md"><div className="flex flex-col justify-between gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center"><div><h2 className="text-base font-semibold tracking-tight text-ink">Findings</h2><p className="mt-0.5 text-sm text-muted">Returned findings are prioritized by the inspection service. Review supporting evidence before taking action.</p></div><Badge tone="default">{result.findings.length} finding{result.findings.length === 1 ? '' : 's'}</Badge></div><div className="p-4 sm:p-5">{result.findings.length ? <div className="space-y-3">{result.findings.map((finding) => <FindingCard key={finding.id} finding={finding} onEvidence={() => navigate(`${evidencePath}?finding=${finding.id}`)} />)}</div> : <div className="rounded-md border border-border bg-bg p-6 text-center"><p className="font-medium text-ink">No findings returned</p><p className="mt-1 text-sm text-muted">This inspection did not return any findings to review.</p></div>}</div></div>
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"><p className="text-sm text-muted">Review <span className="font-semibold text-ink">evidence</span> before viewing the <span className="font-semibold text-ink">report</span>.</p><div className="flex flex-wrap items-center gap-2"><Button variant="secondary" onClick={() => navigate(evidencePath)}>View all evidence</Button><Button onClick={() => navigate(`/inspections/${result.inspectionId}/report`)}>View report <span aria-hidden="true">→</span></Button></div></div>
  </div>
}
