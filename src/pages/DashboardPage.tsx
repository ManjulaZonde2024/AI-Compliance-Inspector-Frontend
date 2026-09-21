import { useEffect, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LoadingState, Skeleton } from '../components/ui/LoadingState'
import { dashboardService } from '../services'
import type { DashboardData, DashboardInspection, InspectionSeverity, InspectionStatus } from '../types'

type DashboardRequest = { status: 'loading' } | { status: 'error' } | { status: 'success'; data: DashboardData }

const severityTones: Record<InspectionSeverity, 'success' | 'info' | 'warning' | 'danger'> = { none: 'success', low: 'info', medium: 'warning', high: 'danger' }

function formatInspectionDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function getOutcomeCounts(data: DashboardData) {
  const total = data.overview.totalInspections
  const compliant = data.overview.compliant
  const nonCompliant = data.overview.nonCompliant
  const complianceRate = total ? Math.round((compliant / total) * 100) : 0
  const nonCompliantRate = total ? Math.round((nonCompliant / total) * 100) : 0
  return { total, compliant, nonCompliant, complianceRate, nonCompliantRate }
}

function getViolationCount(data: DashboardData) {
  return data.openFindingsBySeverity.high + data.openFindingsBySeverity.medium + data.openFindingsBySeverity.low
}

function StatusBadge({ status }: { status: InspectionStatus }) {
  const isCompliant = status === 'compliant'
  return <Badge tone={isCompliant ? 'success' : 'danger'}>{isCompliant ? 'Compliant' : 'Non-compliant'}</Badge>
}

function SeverityBadge({ severity }: { severity: InspectionSeverity }) {
  return <Badge tone={severityTones[severity]} className="border-current/25 bg-surface">{severity === 'none' ? 'No findings' : `${severity[0].toUpperCase()}${severity.slice(1)} severity`}</Badge>
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function CommandHeader({ data, onNewInspection }: { data: DashboardData; onNewInspection: () => void }) {
  const counts = getOutcomeCounts(data)
  const violationCount = getViolationCount(data)
  return (
    <header className="welcome-enter relative overflow-hidden">
      <span className="absolute inset-y-0 left-0 w-1 bg-brand" aria-hidden />
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-stretch">
        <div className="max-w-2xl px-5 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted"><span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />Automated inspection command center</p>
          <h1 className="mt-2.5 text-3xl font-semibold tracking-[-0.025em] text-ink md:text-4xl md:leading-[1.08]">Compliance Dashboard</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            {counts.total} completed inspections, {counts.complianceRate}% compliant, {counts.nonCompliant} non-compliant outcome{counts.nonCompliant === 1 ? '' : 's'}, and {violationCount} returned violation{violationCount === 1 ? '' : 's'}.
          </p>
        </div>
        <div className="flex flex-row items-center gap-5 border-t border-border bg-surface-soft/50 px-5 py-5 sm:gap-6 sm:px-6 sm:py-6 lg:flex-col lg:items-end lg:justify-center lg:gap-4 lg:border-l lg:border-t-0 lg:px-8 lg:py-7">
          <div className="lg:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Current pass rate</p>
            <p className="donut-reveal mt-1 tabular-nums text-5xl font-semibold tracking-[-0.03em] text-ink lg:text-6xl">{counts.complianceRate}<span className="text-2xl font-semibold text-brand lg:text-3xl">%</span></p>
          </div>
          <Button onClick={onNewInspection}><PlusIcon /> New Inspection</Button>
        </div>
      </div>
    </header>
  )
}

function Metric({ label, value, suffix = '', context, tone, mark }: { label: string; value: number; suffix?: string; context: string; tone: string; mark: string }) {
  const [displayValue, setDisplayValue] = useState(0)
  useEffect(() => {
    let frame = 0
    const start = performance.now()
    const duration = 560
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      setDisplayValue(Math.round(value * (1 - (1 - progress) ** 3)))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return (
    <div className="group min-w-0 px-5 py-4 transition-colors duration-200 hover:bg-surface-soft sm:py-5">
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-muted"><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone}`} aria-hidden />{label}</p>
      <p className="count-reveal mt-2.5 flex items-baseline gap-2 text-ink">
        <span className="metric-value tabular-nums text-3xl font-semibold tracking-[-0.02em]">{displayValue}{suffix}</span>
        <span className="text-xs font-semibold text-muted/70" aria-hidden>{mark}</span>
      </p>
      <p className="mt-1 text-[13px] leading-5 text-muted">{context}</p>
    </div>
  )
}

function KpiLedger({ data }: { data: DashboardData }) {
  const counts = getOutcomeCounts(data)
  const violationCount = getViolationCount(data)
  return (
    <section aria-label="Key metrics" className="border-t border-border">
      <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-surface">
          <Metric label="Total Inspections" value={counts.total} context="Completed inspection records" tone="bg-ink" mark="#" />
        </div>
        <div className="bg-surface">
          <Metric label="Compliant" value={counts.compliant} context={`${counts.complianceRate}% of inspections`} tone="bg-success" mark="OK" />
        </div>
        <div className="bg-surface">
          <Metric label="Non-Compliant" value={counts.nonCompliant} context={`${counts.nonCompliantRate}% with returned violations`} tone="bg-danger" mark="!" />
        </div>
        <div className="bg-surface">
          <Metric label="Compliance Rate" value={counts.complianceRate} suffix="%" context="Compliant divided by completed" tone="bg-brand" mark="%" />
        </div>
        <div className="bg-surface sm:col-span-2 lg:col-span-1">
          <Metric label="Violations" value={violationCount} context="Returned findings by severity" tone="bg-warning" mark="!" />
        </div>
      </div>
    </section>
  )
}

function ComplianceOverview({ data }: { data: DashboardData }) {
  const counts = getOutcomeCounts(data)
  const compliantEnd = counts.total ? (counts.compliant / counts.total) * 100 : 0
  const segments = [
    { label: 'Compliant', value: counts.compliant, color: 'bg-success', text: 'text-success' },
    { label: 'Non-compliant', value: counts.nonCompliant, color: 'bg-danger', text: 'text-danger' },
  ]
  return (
    <Card className="overflow-hidden p-0 transition-shadow duration-200 hover:shadow-lg">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">Compliance Overview</h2>
        <p className="mt-1 text-sm leading-6 text-muted">Automated outcomes from completed inspections.</p>
      </div>
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-center">
        <div className="donut-reveal relative mx-auto flex h-40 w-40 items-center justify-center rounded-full" style={{ background: `conic-gradient(var(--color-success) 0 ${compliantEnd}%, var(--color-danger) ${compliantEnd}% 100%)` }} role="img" aria-label={`${counts.complianceRate} percent compliant. ${counts.compliant} compliant and ${counts.nonCompliant} non-compliant inspections.`}>
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border border-border bg-surface shadow-sm">
            <span className="tabular-nums text-3xl font-semibold tracking-[-0.02em] text-ink">{counts.complianceRate}%</span>
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.13em] text-muted">Compliant</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[17px] font-semibold tracking-[-0.01em] text-ink">{counts.compliant} of {counts.total} inspections are compliant.</p>
          <p className="mt-1.5 text-sm leading-6 text-muted">{counts.nonCompliant} automated result{counts.nonCompliant === 1 ? '' : 's'} returned violations or declaration gaps.</p>
          <div className="mt-5 grid gap-4 text-xs text-muted" aria-label="Compliance overview summary">
            {segments.map((segment) => {
              const width = counts.total ? (segment.value / counts.total) * 100 : 0
              return (
                <div key={segment.label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-[13px] font-medium text-ink"><span className={`h-2.5 w-2.5 rounded-full ${segment.color}`} aria-hidden />{segment.label}</span>
                    <strong className={`text-[13px] tabular-nums ${segment.text}`}>{segment.value} ({Math.round(width)}%)</strong>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-border/70"><div className={`progress-reveal h-full rounded-full ${segment.color}`} style={{ width: `${width}%` }} /></div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}

function SeverityInsight({ counts }: { counts: DashboardData['openFindingsBySeverity'] }) {
  const total = counts.high + counts.medium + counts.low
  const rows = [{ label: 'High', value: counts.high, color: 'bg-danger', text: 'text-danger' }, { label: 'Medium', value: counts.medium, color: 'bg-warning', text: 'text-warning' }, { label: 'Low', value: counts.low, color: 'bg-info', text: 'text-info' }]
  return (
    <Card title="Detected Violations" description="Findings grouped by returned severity." className="transition-shadow duration-200 hover:shadow-lg">
      <div className="space-y-4">
        {rows.map((row) => {
          const width = total ? (row.value / total) * 100 : 0
          return (
            <div key={row.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 font-medium text-ink"><span className={`h-2 w-2 rounded-full ${row.color}`} aria-hidden />{row.label}</span>
                <span className={`font-semibold tabular-nums ${row.text}`}>{row.value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-border/70"><div className={`progress-reveal h-full rounded-full ${row.color}`} style={{ width: `${width}%` }} /></div>
            </div>
          )
        })}
      </div>
      <p className="mt-5 border-t border-border/70 pt-4 text-[13px] leading-5 text-muted">{total} finding{total === 1 ? '' : 's'} represented across recent completed inspections.</p>
    </Card>
  )
}

function RecentNonCompliantInspections({ data, onOpen, onViewAll }: { data: DashboardData; onOpen: (id: string) => void; onViewAll: () => void }) {
  const items = data.recentInspections.filter((inspection) => inspection.status !== 'compliant').slice(0, 4)
  return (
    <Card className="overflow-hidden p-0 transition-shadow duration-200 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">Recent Non-Compliant Inspections</h2>
          <p className="mt-1 text-sm leading-6 text-muted">Automated outcomes with returned findings.</p>
        </div>
        <Badge tone="danger" className="mt-1 shrink-0">{items.length} shown</Badge>
      </div>
      {items.length ? (
        <div className="divide-y divide-border/80">
          {items.map((inspection) => (
            <button type="button" key={inspection.id} onClick={() => onOpen(inspection.id)} className="group relative flex w-full flex-col gap-2.5 px-5 py-4 text-left transition-colors duration-150 hover:bg-surface-soft focus-visible:outline-brand sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-6">
              <span className="absolute inset-y-0 left-0 w-[3px] bg-brand opacity-0 transition-opacity duration-150 group-hover:opacity-100" aria-hidden />
              <div className="min-w-0">
                <p className="break-words text-[15px] font-semibold tracking-[-0.008em] text-ink">{inspection.product}</p>
                <p className="mt-0.5 font-mono text-[11px] tracking-tight text-muted">{inspection.id}</p>
                <p className="mt-1.5 break-words text-[13px] leading-6 text-muted">{inspection.findingSummary}</p>
              </div>
              <div className="flex shrink-0 flex-row flex-wrap items-center gap-x-3 gap-y-2 sm:flex-col sm:items-end">
                <SeverityBadge severity={inspection.highestSeverity} />
                <span className="whitespace-nowrap text-xs tabular-nums text-muted">{inspection.findingCount} finding{inspection.findingCount === 1 ? '' : 's'}</span>
                <span className="whitespace-nowrap text-[13px] font-semibold text-ink underline decoration-brand/50 decoration-2 underline-offset-4 group-hover:decoration-brand">Open result</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-6 py-12 text-center sm:px-8">
          <p className="font-medium text-ink">No non-compliant inspections returned.</p>
          <p className="mt-1 text-sm text-muted">Automated inspection outcomes will appear here when findings are detected.</p>
        </div>
      )}
      <div className="border-t border-border bg-surface-soft/60 px-5 py-3 sm:px-6"><Button size="sm" variant="ghost" onClick={onViewAll}>View history</Button></div>
    </Card>
  )
}

function ActivityChart({ data }: { data: DashboardData['activity'] }) {
  const max = Math.max(...data.map((item) => item.inspections), 1)
  const peak = data.reduce((best, item) => (item.inspections > best ? item.inspections : best), 0)
  return (
    <Card className="overflow-hidden p-0 transition-shadow duration-200 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">Inspection Activity</h2>
          <p className="mt-1 text-sm leading-6 text-muted">Completed inspections across the last 7 days.</p>
        </div>
        <span className="mt-1 shrink-0 rounded-full border border-border bg-surface-soft px-3 py-1 text-xs font-semibold text-muted">Daily</span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-4">
          <div className="flex h-40 flex-col justify-between pb-8 text-right text-[11px] tabular-nums text-muted sm:h-48"><span>{max}</span><span>{Math.round(max / 2)}</span><span>0</span></div>
          <div>
            <div className="relative flex h-40 items-end gap-2 border-b border-border px-2 sm:h-48 sm:gap-4">
              {data.map((item, index) => {
                const height = `${(item.inspections / max) * 100}%`
                const isPeak = item.inspections === peak && peak > 0
                return (
                  <div className="group relative flex h-full flex-1 items-end justify-center" key={item.date}>
                    <span className="pointer-events-none absolute bottom-[calc(var(--bar-height)+0.6rem)] z-10 hidden whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-white shadow-sm group-hover:block group-focus-within:block" style={{ '--bar-height': height } as CSSProperties}>{item.inspections} completed</span>
                    <div tabIndex={0} className={`progress-reveal w-full max-w-9 rounded-t-[6px] transition-[background-color,box-shadow,transform] duration-200 group-hover:-translate-y-0.5 ${isPeak ? 'bg-brand' : 'bg-ink/[0.8] group-hover:bg-brand'}`} style={{ height, animationDelay: `${index * 45}ms` }} role="img" aria-label={`${item.date}: ${item.inspections} completed inspections`} />
                  </div>
                )
              })}
            </div>
            <div className="flex gap-2 px-2 pt-3 sm:gap-4">{data.map((item) => <span className="flex-1 whitespace-nowrap text-center text-[11px] text-muted" key={item.date}>{item.date}</span>)}</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

function RecentInspections({ data, onOpen }: { data: DashboardInspection[]; onOpen: (id: string) => void }) {
  return (
    <Card className="overflow-hidden p-0 transition-shadow duration-200 hover:shadow-lg">
      <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">Recent Inspections</h2>
          <p className="mt-1 text-sm leading-6 text-muted">Latest automated outcomes across the workspace.</p>
        </div>
        <span className="text-xs tabular-nums text-muted">{data.length} shown</span>
      </div>
      {data.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <caption className="sr-only">Recent compliance inspections</caption>
            <thead className="border-b border-border bg-surface-soft/70 text-[11px] font-semibold uppercase tracking-[0.09em] text-muted"><tr><th className="px-5 py-3 font-semibold" scope="col">Product</th><th className="px-4 py-3 font-semibold" scope="col">Inspection ID</th><th className="px-4 py-3 font-semibold" scope="col">Completed</th><th className="px-4 py-3 font-semibold" scope="col">Status</th><th className="px-4 py-3 font-semibold" scope="col">Findings</th><th className="px-4 py-3 font-semibold" scope="col">Severity</th><th className="px-5 py-3 text-right font-semibold" scope="col">Action</th></tr></thead>
            <tbody className="divide-y divide-border/80">
              {data.map((inspection) => (
                <tr key={inspection.id} className="group transition-colors duration-150 hover:bg-surface-soft/80">
                  <td className="px-5 py-3"><p className="text-sm font-semibold tracking-[-0.006em] text-ink">{inspection.product}</p><p className="mt-0.5 text-xs text-muted">{inspection.productCategory}</p></td>
                  <td className="px-4 py-3 font-mono text-xs tracking-tight text-muted">{inspection.id}</td>
                  <td className="px-4 py-3 text-sm tabular-nums text-muted"><time dateTime={inspection.inspectedAt}>{formatInspectionDate(inspection.inspectedAt)}</time></td>
                  <td className="px-4 py-3"><StatusBadge status={inspection.status} /></td>
                  <td className="px-4 py-3 text-sm tabular-nums text-ink">{inspection.findingCount} finding{inspection.findingCount === 1 ? '' : 's'}</td>
                  <td className="px-4 py-3"><SeverityBadge severity={inspection.highestSeverity} /></td>
                  <td className="px-5 py-3 text-right"><Button size="sm" variant="secondary" onClick={() => onOpen(inspection.id)}>View result</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-14 text-center"><p className="font-medium text-ink">No inspections yet</p><p className="mt-1 text-sm text-muted">Start an inspection to see its outcome here.</p></div>
      )}
    </Card>
  )
}

function DashboardSkeleton() {
  return <div className="space-y-8"><LoadingState label="Loading dashboard data" /><Skeleton className="h-44 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /><div className="grid gap-6 xl:grid-cols-[minmax(0,8fr)_minmax(0,5fr)]"><Skeleton className="h-80 rounded-2xl" /><Skeleton className="h-80 rounded-2xl" /></div></div>
}

export function DashboardPage() {
  const navigate = useNavigate()
  const [request, setRequest] = useState<DashboardRequest>({ status: 'loading' })
  const loadDashboard = () => { setRequest({ status: 'loading' }); dashboardService.getDashboard().then((data) => setRequest({ status: 'success', data }), () => setRequest({ status: 'error' })) }
  const openNewInspection = () => {
    navigate('/inspections/new')
  }
  useEffect(() => { dashboardService.getDashboard().then((data) => setRequest({ status: 'success', data }), () => setRequest({ status: 'error' })) }, [])
  if (request.status === 'loading') return <DashboardSkeleton />
  if (request.status === 'error') return <Card className="py-14 text-center"><p className="text-lg font-semibold tracking-[-0.01em] text-ink">Dashboard data could not be loaded</p><p className="mt-1.5 text-sm leading-6 text-muted">The inspection portfolio is unavailable right now.</p><Button className="mt-6" variant="secondary" onClick={loadDashboard}>Try again</Button></Card>

  const { data } = request
  const counts = getOutcomeCounts(data)
  if (!counts.total) return <div className="space-y-8"><div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md"><CommandHeader data={data} onNewInspection={openNewInspection} /></div><Card className="py-16 text-center"><p className="text-lg font-semibold text-ink">No inspections yet</p><p className="mt-1 text-sm text-muted">Create your first inspection to begin.</p><Button className="mt-5" onClick={openNewInspection}><PlusIcon /> New Inspection</Button></Card></div>

  return (
    <div className="space-y-5 sm:space-y-6">
      <section aria-label="Inspection command center" className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md">
        <CommandHeader data={data} onNewInspection={openNewInspection} />
        <KpiLedger data={data} />
      </section>
      <div className="grid items-start gap-5 sm:gap-6 xl:grid-cols-[minmax(0,13fr)_minmax(0,7fr)]">
        <ComplianceOverview data={data} />
        <SeverityInsight counts={data.openFindingsBySeverity} />
      </div>
      <RecentNonCompliantInspections data={data} onOpen={(id) => navigate(`/inspections/${id}/result`)} onViewAll={() => navigate('/history')} />
      <ActivityChart data={data.activity} />
      <RecentInspections data={data.recentInspections} onOpen={(id) => navigate(`/inspections/${id}/result`)} />
    </div>
  )
}
