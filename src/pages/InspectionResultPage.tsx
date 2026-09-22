import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LoadingState, Skeleton } from '../components/ui/LoadingState'
import { Reveal } from '../components/ui/Reveal'
import { evidenceService, reportService, resultService } from '../services'
import type { ComplianceStatus, InspectionEvidence, InspectionFinding, InspectionResult } from '../types'

const statusDetails: Record<ComplianceStatus, { label: string; tone: 'success' | 'danger'; marker: string }> = { compliant: { label: 'Compliant', tone: 'success', marker: 'OK' }, 'non-compliant': { label: 'Non-compliant', tone: 'danger', marker: '!' } }
const severityDetails = { high: { label: 'High', tone: 'danger' as const, marker: '!' }, medium: { label: 'Medium', tone: 'warning' as const, marker: '!' }, low: { label: 'Low', tone: 'info' as const, marker: 'i' } }

function formatInspectedAt(value?: string) {
  return value ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Not returned'
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 2.8v6.7M5.2 7 8 9.8 10.8 7M3 13.2h10" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m9.9 3.3 2.8 2.8M4 12l-.7 2.7L6 14l8.1-8.1-2.8-2.8L4 12Z" />
    </svg>
  )
}

function ScoreGauge({ score, tone }: { score: number; tone: 'success' | 'danger' }) {
  const clamped = Math.min(100, Math.max(0, score))
  const barTone = tone === 'danger' ? 'bg-danger grad-bad' : 'bg-success grad-ok'
  const [display, setDisplay] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? score : 0,
  )
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    let frame = 0
    const start = performance.now()
    const duration = 620
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      setDisplay(Math.round(score * (1 - (1 - progress) ** 3)))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [score])
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Compliance score</p>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="count-reveal text-5xl font-semibold leading-none tracking-tight tabular-nums text-ink">{display}</span>
        <span className="text-lg font-medium text-muted">/100</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/5" role="presentation">
        <div className={`h-full rounded-full ${barTone} progress-reveal`} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}

/** Real evidence item — presented with its actual crop/bounding-box data only. */
function EvidenceFigure({ item }: { item: InspectionEvidence }) {
  return (
    <figure className="finding-enter w-32 overflow-hidden rounded-md border border-border bg-surface shadow-sm sm:w-40">
      <div className="relative">
        <img src={item.cropUrl ?? item.imageUrl} alt={item.imageAlt} loading="lazy" className="h-24 w-full object-cover sm:h-28" />
        {item.boundingBox ? (
          <span
            className="pointer-events-none absolute rounded-[2px] border-2 border-danger"
            style={{ left: `${item.boundingBox.x}%`, top: `${item.boundingBox.y}%`, width: `${item.boundingBox.width}%`, height: `${item.boundingBox.height}%` }}
            aria-hidden="true"
          />
        ) : null}
        <span className="absolute left-1 top-1 rounded bg-ink/75 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white">Evidence</span>
      </div>
      <figcaption className="px-2 py-1 text-[10px] leading-4 text-muted">{item.title}</figcaption>
    </figure>
  )
}

function FindingCard({ finding, index = 0, evidence, defaultOpen = false }: { finding: InspectionFinding; index?: number; evidence: InspectionEvidence[]; defaultOpen?: boolean }) {
  const severity = severityDetails[finding.severity]
  const markerTone = severity.tone === 'danger' ? 'bg-danger/10 text-danger' : severity.tone === 'warning' ? 'bg-warning/10 text-warning' : 'bg-info/10 text-info'
  const [open, setOpen] = useState(defaultOpen)
  return (
    <article
      className={`finding-enter rounded-lg border bg-surface transition-[border-color,box-shadow] duration-150 hover:border-brand/25 hover:shadow-sm ${open ? 'border-brand/30 shadow-sm' : 'border-border'}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Collapsed row: severity + title + one-line summary; expand reveals detail. */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 p-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:p-4"
      >
        <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${markerTone}`} aria-hidden="true">{severity.marker}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold leading-snug tracking-tight text-ink">{finding.title}</h3>
              {!open ? <p className="mt-1 truncate text-sm text-muted">{finding.explanation}</p> : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge tone={severity.tone}>{severity.label} severity</Badge>
              <svg className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m4 6.2 4 4 4-4" />
              </svg>
            </div>
          </div>
        </div>
      </button>
      {open ? (
        <div className="details-body space-y-3 border-t border-border/70 px-3.5 pb-4 pt-3 sm:px-4">
          <p className="text-sm leading-6 text-muted">{finding.explanation}</p>
          {finding.detectedValue || finding.expectedValue ? (
            <div className="grid gap-3 sm:grid-cols-2">
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
          {finding.reference ? <p className="text-xs text-muted">Reference: {finding.reference}</p> : null}
          {evidence.length ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted">Evidence</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {evidence.map((item) => <EvidenceFigure key={item.id} item={item} />)}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

/** Reserved placeholder for the future translation feature — no translation runs here. */
function TranslationCard() {
  return (
    <Card title="Translation">
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-surface-soft/60 px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-muted" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 3.5h7M5.5 2v1.5M7 3.5c0 2.4-1.7 4.4-5 5.5M3.4 6.2c.9 1.7 2.4 2.9 4.6 3.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m8.6 13.5 2.7-6 2.7 6M9.7 11.5h3.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="text-sm font-medium text-muted">Coming soon</p>
      </div>
    </Card>
  )
}

export function InspectionResultPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState<InspectionResult | null>(null)
  const [failed, setFailed] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportMessage, setExportMessage] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null)
  const [evidence, setEvidence] = useState<InspectionEvidence[]>([])

  useEffect(() => {
    if (!id) return
    resultService.getResult(id).then(setResult, () => setFailed(true))
    // Evidence supports the finding accordions — absence keeps the page intact.
    evidenceService.getEvidence(id).then(setEvidence, () => setEvidence([]))
  }, [id])

  const downloadSummary = (format: 'pdf' | 'editable') => {
    if (!id || exporting) return
    setExporting(true)
    setExportMessage(null)
    const action = format === 'pdf' ? reportService.downloadReportPdf(id) : reportService.exportReportEditable(id)
    action.then(
      () => setExportMessage({ tone: 'success', text: format === 'pdf' ? 'PDF summary downloaded' : 'Editable summary downloaded' }),
      () => setExportMessage({ tone: 'danger', text: 'Unable to download the summary. Please try again.' }),
    ).finally(() => setExporting(false))
  }

  if (!result && !failed) return <div className="space-y-5"><LoadingState label="Loading inspection result" /><Skeleton className="h-44" /><Skeleton className="h-96" /></div>
  if (failed || !result) return <Card className="py-14 text-center"><p className="font-semibold text-ink">Result could not be loaded</p><p className="mt-1 text-sm text-muted">The inspection result is unavailable right now. Please return to the dashboard and try again.</p><Button className="mt-5" variant="secondary" onClick={() => navigate('/dashboard')}>Back to dashboard</Button></Card>

  const status = statusDetails[result.status]
  const highCount = result.findings.filter((finding) => finding.severity === 'high').length
  return (
    <div>
      <div className="welcome-enter mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-xs text-muted">{result.inspectionId}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Inspection result</h1>
          <p className="mt-1 text-sm text-muted">{result.productName}{result.category ? ` · ${result.category}` : ''}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
          <Button size="sm" className="cta-grad" onClick={() => downloadSummary('pdf')} disabled={exporting} aria-busy={exporting}>
            <DownloadIcon /> {exporting ? 'Preparing…' : 'Download PDF'}
          </Button>
        </div>
      </div>

      {exportMessage ? (
        <p className={`mb-3 rounded-md border px-4 py-2.5 text-sm transition-colors duration-200 ${exportMessage.tone === 'success' ? 'border-success/25 bg-success/10 text-success' : 'border-danger/25 bg-danger/5 text-danger'}`} role={exportMessage.tone === 'success' ? 'status' : 'alert'}>
          {exportMessage.text}
        </p>
      ) : null}

      {/* Compliance outcome — calm neutral surface; semantic color used as a
          focused accent (rail + marker) rather than flooding the card. */}
      <section className="welcome-enter relative overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-md sm:p-5" aria-labelledby="outcome-heading">
        <span className={`pointer-events-none absolute inset-y-0 left-0 w-1 ${result.status === 'non-compliant' ? 'bg-danger' : 'bg-success'}`} aria-hidden="true" />
        <span className="plum-accent pointer-events-none absolute inset-x-0 top-0 h-px opacity-70" aria-hidden="true" />
        <div className="flex flex-col gap-5 pl-3 lg:flex-row lg:items-center lg:justify-between lg:pl-4">
          <div className="flex items-start gap-4">
            <span className={`status-pop flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold shadow-sm ${result.status === 'non-compliant' ? 'bg-danger text-white' : 'bg-success text-white'}`} aria-hidden="true">{status.marker}</span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Overall compliance status</p>
              <h2 id="outcome-heading" className="mt-1.5 text-2xl font-semibold tracking-tight text-ink">{status.label}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{result.summary}</p>
            </div>
          </div>
          <div className="shrink-0 lg:border-l lg:border-black/10 lg:pl-8">{result.score !== undefined ? <ScoreGauge score={result.score} tone={status.tone} /> : null}</div>
        </div>
      </section>

      <Reveal delay={40}>
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface shadow-md">
          <div className="grid sm:grid-cols-3 sm:divide-x sm:divide-border">
            <div className="flex items-center gap-3 p-3.5 sm:p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-light text-sm font-semibold text-brand" aria-hidden="true">#</span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Total findings</p>
                <p className="mt-1 text-2xl font-semibold leading-none tabular-nums text-ink">{result.findings.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-border p-3.5 sm:border-t-0 sm:p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-danger/10 text-sm font-semibold text-danger" aria-hidden="true">!</span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">High severity</p>
                <p className="mt-1 text-2xl font-semibold leading-none tabular-nums text-danger">{highCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-border p-3.5 sm:border-t-0 sm:p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-info/10 text-sm font-semibold text-info" aria-hidden="true">◷</span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Inspection date</p>
                <p className="mt-1 text-sm font-medium leading-none text-ink">{formatInspectedAt(result.inspectedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface shadow-md">
          <div className="flex flex-col justify-between gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-ink">Findings</h2>
              <p className="mt-0.5 text-sm text-muted">Findings are returned in priority order by the inspection service.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="default">{result.findings.length} finding{result.findings.length === 1 ? '' : 's'}</Badge>
              {evidence.length ? <Badge tone="info">{evidence.length} evidence</Badge> : null}
            </div>
          </div>
          <div className="p-3.5 sm:p-4">
            {result.findings.length ? (
              <div className="space-y-2.5">
                {result.findings.map((finding, index) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    index={index}
                    evidence={evidence.filter((item) => item.findingId === finding.id)}
                    defaultOpen={index === 0}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-border bg-bg p-5 text-center">
                <p className="font-medium text-ink">No findings returned</p>
                <p className="mt-1 text-sm text-muted">This inspection did not return any findings to review.</p>
              </div>
            )}
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <section className="mt-4 overflow-hidden rounded-lg border border-border bg-surface shadow-md" aria-labelledby="download-summary-heading">
          <span className="plum-accent grad-drift block h-1" aria-hidden="true" />
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="min-w-0">
              <h2 id="download-summary-heading" className="text-base font-semibold tracking-tight text-ink">Download Summary</h2>
              <p className="mt-0.5 text-sm text-muted">Full inspection summary — compliance result, findings and supporting evidence.</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button className="cta-grad" onClick={() => downloadSummary('pdf')} disabled={exporting} aria-busy={exporting}>
                <DownloadIcon /> {exporting ? 'Preparing…' : 'PDF'}
              </Button>
              <Button variant="secondary" onClick={() => downloadSummary('editable')} disabled={exporting} aria-busy={exporting}>
                <EditIcon /> {exporting ? 'Preparing…' : 'Editable format'}
              </Button>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={160}>
        <div className="mt-4">
          <TranslationCard />
        </div>
      </Reveal>
    </div>
  )
}
