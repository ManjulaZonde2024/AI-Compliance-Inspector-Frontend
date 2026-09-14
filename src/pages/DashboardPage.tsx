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
    <header className="relative overflow-hidden rounded-lg border border-navy-line/20 bg-navy px-5 py-5 text-white shadow-[0_18px_48px_rgb(11_31_58_/_0.18)] sm:px-6">
      <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(37,99,235,0.28),transparent_44%,rgba(22,163,74,0.13))]" aria-hidden />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100/70">Automated inspection command center</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal md:text-3xl">Compliance Dashboard</h1>
          <p className="mt-2 text-sm leading-6 text-blue-100/78">
            {counts.total} completed inspections, {counts.complianceRate}% compliant, {counts.nonCompliant} non-compliant outcome{counts.nonCompliant === 1 ? '' : 's'}, and {violationCount} returned violation{violationCount === 1 ? '' : 's'}.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-md border border-white/10 bg-white/[0.08] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-100/60">Current pass rate</p>
            <p className="mt-1 text-2xl font-semibold">{counts.complianceRate}%</p>
          </div>
          <Button variant="onDark" onClick={onNewInspection}><PlusIcon /> New Inspection</Button>
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
    <div className="group relative overflow-hidden rounded-lg border border-border bg-surface p-4 shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-md sm:p-5">
      <span className={`absolute inset-x-0 top-0 h-1 ${tone}`} aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
          <p className="count-reveal mt-3 text-3xl font-semibold tracking-normal text-ink">{displayValue}{suffix}</p>
          <p className="mt-1 text-xs leading-5 text-muted">{context}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-bg text-sm font-semibold text-ink transition-colors group-hover:bg-brand-light group-hover:text-brand" aria-hidden>{mark}</span>
      </div>
    </div>
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
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-ink">Compliance Overview</h2>
        <p className="mt-1 text-sm text-muted">Automated outcomes from completed inspections.</p>
      </div>
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-center">
        <div className="donut-reveal relative mx-auto flex h-44 w-44 items-center justify-center rounded-full" style={{ background: `conic-gradient(var(--color-success) 0 ${compliantEnd}%, var(--color-danger) ${compliantEnd}% 100%)` }} role="img" aria-label={`${counts.complianceRate} percent compliant. ${counts.compliant} compliant and ${counts.nonCompliant} non-compliant inspections.`}>
          <div className="flex h-[7.5rem] w-[7.5rem] flex-col items-center justify-center rounded-full border border-border bg-surface shadow-sm">
            <span className="text-3xl font-semibold tracking-normal text-ink">{counts.complianceRate}%</span>
            <span className="mt-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-muted">Compliant</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">{counts.compliant} of {counts.total} inspections are compliant.</p>
          <p className="mt-1 text-sm leading-6 text-muted">{counts.nonCompliant} automated result{counts.nonCompliant === 1 ? '' : 's'} returned violations or declaration gaps.</p>
          <div className="mt-5 grid gap-4 text-xs text-muted" aria-label="Compliance overview summary">
            {segments.map((segment) => {
              const width = counts.total ? (segment.value / counts.total) * 100 : 0
              return (
                <div key={segment.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${segment.color}`} aria-hidden />{segment.label}</span>
                    <strong className={segment.text}>{segment.value} ({Math.round(width)}%)</strong>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg"><div className={`progress-reveal h-full rounded-full ${segment.color}`} style={{ width: `${width}%` }} /></div>
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
    <Card title="Detected Violations" description="Findings grouped by returned severity.">
      <div className="space-y-4">
        {rows.map((row) => {
          const width = total ? (row.value / total) * 100 : 0
          return (
            <div key={row.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 text-muted"><span className={`h-2 w-2 rounded-full ${row.color}`} aria-hidden />{row.label}</span>
                <span className={`font-semibold ${row.text}`}>{row.value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-bg"><div className={`progress-reveal h-full rounded-full ${row.color}`} style={{ width: `${width}%` }} /></div>
            </div>
          )
        })}
      </div>
      <p className="mt-4 text-xs leading-5 text-muted">{total} finding{total === 1 ? '' : 's'} represented across recent completed inspections.</p>
    </Card>
  )
}

function RecentNonCompliantInspections({ data, onOpen, onViewAll }: { data: DashboardData; onOpen: (id: string) => void; onViewAll: () => void }) {
  const items = data.recentInspections.filter((inspection) => inspection.status !== 'compliant').slice(0, 4)
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-base font-semibold text-ink">Recent Non-Compliant Inspections</h2>
          <p className="mt-1 text-sm text-muted">Automated outcomes with returned findings.</p>
        </div>
        <Badge tone="danger">{items.length} shown</Badge>
      </div>
      {items.length ? (
        <div className="divide-y divide-border">
          {items.map((inspection) => (
            <button type="button" key={inspection.id} onClick={() => onOpen(inspection.id)} className="group flex w-full flex-col gap-3 px-5 py-4 text-left transition-colors hover:bg-brand-light/50 focus-visible:outline-brand sm:flex-row sm:items-start sm:justify-between sm:px-6">
              <div className="min-w-0">
                <p className="break-words text-sm font-semibold text-ink">{inspection.product}</p>
                <p className="mt-1 font-mono text-[11px] text-muted">{inspection.id}</p>
                <p className="mt-2 break-words text-xs leading-5 text-muted">{inspection.findingSummary}</p>
              </div>
              <div className="flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end">
                <SeverityBadge severity={inspection.highestSeverity} />
                <span className="whitespace-nowrap text-[11px] text-muted">{inspection.findingCount} finding{inspection.findingCount === 1 ? '' : 's'}</span>
                <span className="whitespace-nowrap text-xs font-medium text-brand group-hover:text-brand-dark">Open result</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="px-5 py-10 text-center sm:px-6">
          <p className="font-medium text-ink">No non-compliant inspections returned.</p>
          <p className="mt-1 text-sm text-muted">Automated inspection outcomes will appear here when findings are detected.</p>
        </div>
      )}
      <div className="border-t border-border px-5 py-4 sm:px-6"><Button size="sm" variant="ghost" onClick={onViewAll}>View history</Button></div>
    </Card>
  )
}

function ActivityChart({ data }: { data: DashboardData['activity'] }) {
  const max = Math.max(...data.map((item) => item.inspections), 1)
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-base font-semibold text-ink">Inspection Activity</h2>
          <p className="mt-1 text-sm text-muted">Completed inspections across the last 7 days.</p>
        </div>
        <span className="rounded-md border border-border bg-bg px-2.5 py-1 text-xs font-medium text-muted">Daily</span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
          <div className="flex h-48 flex-col justify-between pb-7 text-right text-[10px] text-muted"><span>{max}</span><span>{Math.round(max / 2)}</span><span>0</span></div>
          <div>
            <div className="relative flex h-48 items-end gap-2 border-b border-l border-border bg-[linear-gradient(to_top,var(--color-border)_1px,transparent_1px)] bg-[length:100%_50%] px-2 sm:gap-3">
              {data.map((item, index) => {
                const height = `${(item.inspections / max) * 100}%`
                return (
                  <div className="group relative flex h-full flex-1 items-end justify-center" key={item.date}>
                    <span className="pointer-events-none absolute bottom-[calc(var(--bar-height)+0.55rem)] z-10 hidden whitespace-nowrap rounded-md bg-navy px-2 py-1 text-[11px] text-white shadow-sm group-hover:block group-focus-within:block" style={{ '--bar-height': height } as CSSProperties}>{item.inspections} completed</span>
                    <div tabIndex={0} className="progress-reveal w-full max-w-8 rounded-t-md bg-brand transition-[background-color,box-shadow] duration-200 group-hover:bg-brand-dark group-hover:shadow-[0_0_0_3px_rgb(37_99_235_/_0.12)] focus-visible:bg-brand-dark" style={{ height, animationDelay: `${index * 45}ms` }} role="img" aria-label={`${item.date}: ${item.inspections} completed inspections`} />
                  </div>
                )
              })}
            </div>
            <div className="flex gap-2 px-2 pt-2 sm:gap-3">{data.map((item) => <span className="flex-1 whitespace-nowrap text-center text-[10px] text-muted" key={item.date}>{item.date}</span>)}</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

function RecentInspections({ data, onOpen }: { data: DashboardInspection[]; onOpen: (id: string) => void }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-base font-semibold text-ink">Recent Inspections</h2>
          <p className="mt-1 text-sm text-muted">Latest automated outcomes across the workspace.</p>
        </div>
        <span className="text-xs text-muted">{data.length} shown</span>
      </div>
      {data.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <caption className="sr-only">Recent compliance inspections</caption>
            <thead className="bg-bg text-[11px] font-semibold uppercase tracking-[0.08em] text-muted"><tr><th className="px-5 py-3" scope="col">Product</th><th className="px-4 py-3" scope="col">Inspection ID</th><th className="px-4 py-3" scope="col">Completed</th><th className="px-4 py-3" scope="col">Status</th><th className="px-4 py-3" scope="col">Findings</th><th className="px-4 py-3" scope="col">Severity</th><th className="px-5 py-3 text-right" scope="col">Action</th></tr></thead>
            <tbody className="divide-y divide-border">
              {data.map((inspection) => (
                <tr key={inspection.id} className="group transition-colors hover:bg-brand-light/45">
                  <td className="px-5 py-4"><p className="font-semibold text-ink">{inspection.product}</p><p className="mt-1 text-xs text-muted">{inspection.productCategory}</p></td>
                  <td className="px-4 py-4 font-mono text-xs text-muted">{inspection.id}</td>
                  <td className="px-4 py-4 text-sm text-muted"><time dateTime={inspection.inspectedAt}>{formatInspectionDate(inspection.inspectedAt)}</time></td>
                  <td className="px-4 py-4"><StatusBadge status={inspection.status} /></td>
                  <td className="px-4 py-4 text-sm text-ink">{inspection.findingCount} finding{inspection.findingCount === 1 ? '' : 's'}</td>
                  <td className="px-4 py-4"><SeverityBadge severity={inspection.highestSeverity} /></td>
                  <td className="px-5 py-4 text-right"><Button size="sm" variant="secondary" onClick={() => onOpen(inspection.id)}>View result</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 py-12 text-center"><p className="font-medium text-ink">No inspections yet</p><p className="mt-1 text-sm text-muted">Start an inspection to see its outcome here.</p></div>
      )}
    </Card>
  )
}

function DashboardSkeleton() {
  return <div className="space-y-6"><LoadingState label="Loading dashboard data" /><Skeleton className="h-32" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-28" />)}</div><div className="grid gap-6 xl:grid-cols-2"><Skeleton className="h-80" /><Skeleton className="h-80" /></div></div>
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
  if (request.status === 'error') return <Card className="py-12 text-center"><p className="font-semibold text-ink">Dashboard data could not be loaded</p><p className="mt-1 text-sm text-muted">The inspection portfolio is unavailable right now.</p><Button className="mt-5" variant="secondary" onClick={loadDashboard}>Try again</Button></Card>

  const { data } = request
  const counts = getOutcomeCounts(data)
  const violationCount = getViolationCount(data)
  if (!counts.total) return <div className="space-y-6"><CommandHeader data={data} onNewInspection={openNewInspection} /><Card className="py-16 text-center"><p className="text-lg font-semibold text-ink">No inspections yet</p><p className="mt-1 text-sm text-muted">Create your first inspection to begin.</p><Button className="mt-5" onClick={openNewInspection}><PlusIcon /> New Inspection</Button></Card></div>

  return (
    <div className="space-y-6">
      <CommandHeader data={data} onNewInspection={openNewInspection} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Total Inspections" value={counts.total} context="Completed inspection records" tone="bg-brand" mark="#" />
        <Metric label="Compliant" value={counts.compliant} context={`${counts.complianceRate}% of inspections`} tone="bg-success" mark="OK" />
        <Metric label="Non-Compliant" value={counts.nonCompliant} context={`${counts.nonCompliantRate}% with returned violations`} tone="bg-danger" mark="!" />
        <Metric label="Compliance Rate" value={counts.complianceRate} suffix="%" context="Compliant divided by completed" tone="bg-info" mark="%" />
        <Metric label="Violations" value={violationCount} context="Returned findings by severity" tone="bg-warning" mark="!" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)]">
        <ComplianceOverview data={data} />
        <SeverityInsight counts={data.openFindingsBySeverity} />
      </div>
      <RecentNonCompliantInspections data={data} onOpen={(id) => navigate(`/inspections/${id}/result`)} onViewAll={() => navigate('/history')} />
      <ActivityChart data={data.activity} />
      <RecentInspections data={data.recentInspections} onOpen={(id) => navigate(`/inspections/${id}/result`)} />
    </div>
  )
}
