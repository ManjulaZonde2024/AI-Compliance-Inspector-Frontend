import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LoadingState, Skeleton } from '../components/ui/LoadingState'
import { resultService } from '../services'
import type { ComplianceStatus, InspectionFinding, InspectionResult } from '../types'

const statusDetails: Record<ComplianceStatus, { label: string; tone: 'success' | 'danger'; marker: string }> = { compliant: { label: 'Compliant', tone: 'success', marker: 'OK' }, 'non-compliant': { label: 'Non-compliant', tone: 'danger', marker: '!' } }
const severityDetails = { high: { label: 'High', tone: 'danger' as const, marker: '!' }, medium: { label: 'Medium', tone: 'warning' as const, marker: '!' }, low: { label: 'Low', tone: 'info' as const, marker: 'i' } }

function FindingCard({ finding, onEvidence }: { finding: InspectionFinding; onEvidence: () => void }) {
  const severity = severityDetails[finding.severity]
  return <article className="finding-enter border-t border-border py-5 transition-colors hover:bg-bg/60 first:border-t-0 first:pt-0 last:pb-0"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg text-sm font-semibold text-ink" aria-hidden="true">{severity.marker}</span><div><h3 className="font-semibold text-ink">{finding.title}</h3><p className="mt-1 text-sm leading-6 text-muted">{finding.explanation}</p></div></div><Badge tone={severity.tone}>{severity.label} severity</Badge></div><div className="mt-4 grid gap-3 pl-10 sm:grid-cols-2">{finding.detectedValue ? <div><p className="text-xs font-medium uppercase tracking-wide text-muted">Detected</p><p className="mt-1 text-sm text-ink">{finding.detectedValue}</p></div> : null}{finding.expectedValue ? <div><p className="text-xs font-medium uppercase tracking-wide text-muted">Expected</p><p className="mt-1 text-sm text-ink">{finding.expectedValue}</p></div> : null}</div><div className="mt-4 flex flex-wrap items-center gap-3 pl-10">{finding.reference ? <span className="text-xs text-muted">Reference: {finding.reference}</span> : null}{finding.evidenceId ? <Button size="sm" onClick={onEvidence}>Review evidence <span aria-hidden="true">→</span></Button> : <span className="text-xs text-muted">No supporting evidence returned</span>}</div></article>
}

export function InspectionResultPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState<InspectionResult | null>(null)
  const [failed, setFailed] = useState(false)
  const animatedResultId = useRef('')

  useEffect(() => { if (id) resultService.getResult(id).then(setResult, () => setFailed(true)) }, [id])
    useEffect(() => {
      if (result?.score === undefined || animatedResultId.current === result.inspectionId) return
      animatedResultId.current = result.inspectionId
      const targetScore = result.score
      let frame = 0
      const start = performance.now()
      const animate = (now: number) => {
        const progress = Math.min((now - start) / 550, 1)
        setResult((current) => current ? { ...current, score: Math.round(targetScore * (1 - (1 - progress) ** 3)) } : current)
        if (progress < 1) frame = requestAnimationFrame(animate)
      }
      frame = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(frame)
    }, [result?.inspectionId, result?.score])

  if (!result && !failed) return <div className="space-y-6"><LoadingState label="Loading inspection result" /><Skeleton className="h-44" /><Skeleton className="h-96" /></div>
  if (failed || !result) return <Card className="py-14 text-center"><p className="font-semibold text-ink">Result could not be loaded</p><p className="mt-1 text-sm text-muted">The inspection result is unavailable right now. Please return to the dashboard and try again.</p><Button className="mt-5" variant="secondary" onClick={() => navigate('/dashboard')}>Back to dashboard</Button></Card>

  const status = statusDetails[result.status]
  const highCount = result.findings.filter((finding) => finding.severity === 'high').length
  const evidencePath = `/inspections/${result.inspectionId}/evidence`
  return <div><div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-mono text-xs text-muted">{result.inspectionId}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Inspection result</h1><p className="mt-1 text-sm text-muted">{result.productName}{result.category ? ` · ${result.category}` : ''}</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')}>Back to dashboard</Button><Button variant="secondary" size="sm" onClick={() => navigate(`/inspections/${result.inspectionId}/report`)}>View report</Button></div></div><section className={`rounded-lg border p-5 sm:p-6 ${result.status === 'non-compliant' ? 'border-danger/25 bg-danger/5' : 'border-success/25 bg-success/5'}`} aria-labelledby="outcome-heading"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-4"><span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${result.status === 'non-compliant' ? 'bg-danger text-white' : 'bg-success text-white'}`} aria-hidden="true">{status.marker}</span><div><p className="text-xs font-medium uppercase tracking-wide text-muted">Overall compliance status</p><h2 id="outcome-heading" className="mt-1 text-2xl font-semibold text-ink">{status.label}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{result.summary}</p></div></div>{result.score !== undefined ? <div className="border-t border-black/10 pt-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"><p className="text-xs font-medium uppercase tracking-wide text-muted">Compliance score</p><p className="mt-1 text-4xl font-semibold text-ink">{result.score}<span className="text-lg text-muted">/100</span></p></div> : null}</div></section><div className="mt-6 grid gap-4 sm:grid-cols-3"><Card className="p-4"><p className="text-xs uppercase tracking-wide text-muted">Total findings</p><p className="mt-1 text-2xl font-semibold text-ink">{result.findings.length}</p></Card><Card className="p-4"><p className="text-xs uppercase tracking-wide text-muted">High severity</p><p className="mt-1 text-2xl font-semibold text-danger">{highCount}</p></Card><Card className="p-4"><p className="text-xs uppercase tracking-wide text-muted">Inspection date</p><p className="mt-2 text-sm font-medium text-ink">{result.inspectedAt ? new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(result.inspectedAt)) : 'Not returned'}</p></Card></div><Card className="mt-6" title="Findings" description="Returned findings are prioritized by the inspection service. Review supporting evidence before taking action.">{result.findings.length ? <div className="mt-1">{result.findings.map((finding) => <FindingCard key={finding.id} finding={finding} onEvidence={() => navigate(`${evidencePath}?finding=${finding.id}`)} />)}</div> : <div className="rounded-md border border-border bg-bg p-6 text-center"><p className="font-medium text-ink">No findings returned</p><p className="mt-1 text-sm text-muted">This inspection did not return any findings to review.</p></div>}</Card><div className="mt-6 flex flex-wrap justify-end gap-2"><Button variant="secondary" onClick={() => navigate(evidencePath)}>View all evidence</Button><Button onClick={() => navigate(`/inspections/${result.inspectionId}/report`)}>View report <span aria-hidden="true">→</span></Button></div></div>
}
