import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { EvidenceViewer } from '../components/inspection/EvidenceViewer'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LoadingState, Skeleton } from '../components/ui/LoadingState'
import { evidenceService, resultService } from '../services'
import type { FindingSeverity, InspectionEvidence, InspectionResult } from '../types'

const severityDetails: Record<FindingSeverity, { label: string; tone: 'danger' | 'warning' | 'info' }> = {
  high: { label: 'High', tone: 'danger' },
  medium: { label: 'Medium', tone: 'warning' },
  low: { label: 'Low', tone: 'info' },
}

export function InspectionEvidencePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [result, setResult] = useState<InspectionResult | null>(null)
  const [evidence, setEvidence] = useState<InspectionEvidence[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [failed, setFailed] = useState(false)

  useEffect(() => { if (!id) return; Promise.all([resultService.getResult(id), evidenceService.getEvidence(id)]).then(([loadedResult, loadedEvidence]) => { setResult(loadedResult); setEvidence(loadedEvidence); const findingId = searchParams.get('finding'); setSelectedId(loadedEvidence.find((item) => item.findingId === findingId)?.id ?? loadedEvidence[0]?.id ?? '') }, () => setFailed(true)) }, [id, searchParams])

  if (!result && !failed) return <div className="space-y-6"><LoadingState label="Loading inspection evidence" /><Skeleton className="h-20" /><Skeleton className="h-[36rem]" /></div>
  if (failed || !result) return <Card className="py-14 text-center"><p className="font-semibold text-ink">Evidence could not be loaded</p><p className="mt-1 text-sm text-muted">Supporting evidence is unavailable right now. Please return to the inspection result.</p><Button className="mt-5" variant="secondary" onClick={() => navigate(`/inspections/${id}/result`)}>Back to result</Button></Card>

  const selected = evidence.find((item) => item.id === selectedId)
  const selectedIndex = evidence.findIndex((item) => item.id === selectedId)
  const selectedFinding = result.findings.find((finding) => finding.id === selected?.findingId)

  return <div><div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="font-mono text-xs text-muted">{result.inspectionId}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Evidence review</h1><p className="mt-1 text-sm text-muted">Supporting evidence for {result.productName}{result.category ? ` · ${result.category}` : ''}</p></div><div className="flex flex-wrap gap-2"><Button variant="secondary" size="sm" onClick={() => navigate(`/inspections/${id}/result`)}>Back to result</Button><Button size="sm" onClick={() => navigate(`/inspections/${id}/report`)}>View report <span aria-hidden="true">→</span></Button></div></div>{!evidence.length ? <Card className="py-14 text-center"><p className="font-semibold text-ink">No evidence returned</p><p className="mt-1 text-sm text-muted">The service did not return supporting evidence for this inspection.</p></Card> : <div className="grid gap-6 xl:grid-cols-[16rem_minmax(0,1fr)]"><Card className="h-fit p-4" title="Findings" description="Select an item to inspect the supporting image returned for that finding."><div className="mt-4 space-y-2">{evidence.map((item, index) => {
              const finding = result.findings.find((candidate) => candidate.id === item.findingId)
              const severity = finding ? severityDetails[finding.severity] : undefined
              return (
                <button type="button" key={item.id} onClick={() => setSelectedId(item.id)} aria-current={selectedId === item.id ? 'true' : undefined} className={`w-full rounded-md border p-3 text-left transition-[background-color,border-color,transform] duration-150 ${selectedId === item.id ? 'border-brand bg-brand-light shadow-sm' : 'border-border hover:-translate-y-px hover:bg-bg'}`}>
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-muted">Evidence {index + 1}</span>
                    {severity ? <Badge tone={severity.tone}>{severity.label}</Badge> : null}
                  </span>
                  <span className="mt-1 block text-sm font-medium text-ink">{item.title}</span>
                  <span className="mt-1 block text-xs text-muted">{item.boundingBox ? 'Region highlighted for this finding' : 'Full image returned'}</span>
                </button>
              )
            })}</div></Card>{selected ? <EvidenceViewer evidence={selected} severity={selectedFinding?.severity} position={{ current: selectedIndex + 1, total: evidence.length }} /> : <Card className="py-14 text-center"><p className="font-semibold text-ink">Select a finding</p><p className="mt-1 text-sm text-muted">Choose a finding to inspect its returned evidence.</p></Card>}</div>}</div>
}
