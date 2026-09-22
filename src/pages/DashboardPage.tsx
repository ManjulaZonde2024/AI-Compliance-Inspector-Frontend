import { useEffect, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LoadingState, Skeleton } from '../components/ui/LoadingState'
import { Reveal } from '../components/ui/Reveal'
import { dashboardService } from '../services'
import type { DashboardData } from '../types'

type DashboardRequest = { status: 'loading' } | { status: 'error' } | { status: 'success'; data: DashboardData }

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

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function OverviewHeader({ data, onNewInspection }: { data: DashboardData; onNewInspection: () => void }) {
  const counts = getOutcomeCounts(data)
  const violationCount = getViolationCount(data)
  return (
    <header className="welcome-enter plum-panel relative overflow-hidden">
      <span className="glow-orb -left-20 -top-24 h-56 w-56" aria-hidden />
      <span className="glow-orb -bottom-28 right-10 h-56 w-56 [animation-delay:-8s]" aria-hidden />
      <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-brand to-accent" aria-hidden />
      <div className="relative z-10 grid gap-0 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-stretch">
        <div className="max-w-2xl px-5 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
          <h1 className="text-3xl font-semibold tracking-[-0.025em] text-ink md:text-4xl md:leading-[1.08]">Compliance Dashboard</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
            {counts.total} completed inspections, {counts.complianceRate}% compliant, {counts.nonCompliant} non-compliant outcome{counts.nonCompliant === 1 ? '' : 's'}, and {violationCount} returned violation{violationCount === 1 ? '' : 's'}.
          </p>
        </div>
        <div className="flex flex-row items-center gap-5 border-t border-border bg-surface-soft/50 px-5 py-4 sm:gap-6 sm:px-6 sm:py-5 lg:flex-col lg:items-end lg:justify-center lg:gap-4 lg:border-l lg:border-t-0 lg:px-8 lg:py-6">
          <div className="lg:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Current pass rate</p>
            <p className="donut-reveal mt-1 plum-accent bg-clip-text tabular-nums text-5xl font-semibold tracking-[-0.03em] text-transparent [text-shadow:0_2px_18px_color-mix(in_srgb,var(--color-brand)_28%,transparent)] lg:text-6xl">{counts.complianceRate}<span className="text-2xl font-semibold text-brand lg:text-3xl">%</span></p>
          </div>
          <Button onClick={onNewInspection} className="cta-grad shadow-lg hover:shadow-xl"><PlusIcon /> New Inspection</Button>
        </div>
      </div>
    </header>
  )
}

function Metric({ label, value, suffix = '', context, tone, mark }: { label: string; value: number; suffix?: string; context: string; tone: string; mark: string }) {
  const [displayValue, setDisplayValue] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? value : 0,
  )
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
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
    <div className="group min-w-0 px-5 py-4 transition-[background-color,box-shadow] duration-200 hover:bg-surface-soft hover:shadow-sm sm:py-5">
      <span className="plum-accent grad-drift mb-2.5 block h-1 w-8 rounded-full opacity-85" aria-hidden />
      <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.13em] text-muted"><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tone}`} aria-hidden />{label}</p>
      <p className="count-reveal mt-2 flex items-baseline gap-2 text-ink">
        <span className="metric-value tabular-nums text-3xl font-semibold tracking-[-0.02em] transition-transform duration-200 group-hover:translate-x-0.5">{displayValue}{suffix}</span>
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
    { label: 'Compliant', value: counts.compliant, color: 'bg-success', text: 'text-success', grad: 'grad-ok' },
    { label: 'Non-compliant', value: counts.nonCompliant, color: 'bg-danger', text: 'text-danger', grad: 'grad-bad' },
  ]
  return (
    <Card className="overflow-hidden p-0 transition-shadow duration-200 hover:shadow-lg">
      <div className="border-b border-border px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold tracking-[-0.015em] text-ink">Compliance Overview</h2>
        <p className="mt-1 text-sm leading-6 text-muted">Automated outcomes from completed inspections.</p>
      </div>
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-center">
        <div className="donut-reveal relative mx-auto flex h-40 w-40 items-center justify-center rounded-full shadow-[0_20px_45px_-26px_rgba(122,62,104,0.75)]" style={{ background: `conic-gradient(var(--color-success) 0 ${compliantEnd}%, var(--color-danger) ${compliantEnd}% 100%)` }} role="img" aria-label={`${counts.complianceRate} percent compliant. ${counts.compliant} compliant and ${counts.nonCompliant} non-compliant inspections.`}>
          <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full border border-brand/20 bg-surface shadow-inner ring-4 ring-brand/10">
            <span className="tabular-nums text-3xl font-semibold tracking-[-0.02em] text-ink transition-transform duration-300 hover:scale-105">{counts.complianceRate}%</span>
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
                  <div className="h-1.5 overflow-hidden rounded-full bg-border/70"><div className={`progress-reveal h-full rounded-full ${segment.color} ${segment.grad}`} style={{ width: `${width}%` }} /></div>
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
  const rows = [{ label: 'High', value: counts.high, color: 'bg-danger', text: 'text-danger', grad: 'grad-bad' }, { label: 'Medium', value: counts.medium, color: 'bg-warning', text: 'text-warning', grad: 'grad-warn' }, { label: 'Low', value: counts.low, color: 'bg-info', text: 'text-info', grad: 'grad-info' }]
  return (
    <Card title="Detected Violations" description="Findings grouped by returned severity." className="transition-shadow duration-200 hover:shadow-lg">
      <div className="space-y-3">
        {rows.map((row) => {
          const width = total ? (row.value / total) * 100 : 0
          return (
            <div key={row.label} className="-mx-2 rounded-md px-2 py-1.5 transition-colors duration-150 hover:bg-surface-soft">
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 font-medium text-ink"><span className={`h-2 w-2 rounded-full ${row.color}`} aria-hidden />{row.label}</span>
                <span className={`font-semibold tabular-nums ${row.text}`}>{row.value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-border/70"><div className={`progress-reveal h-full rounded-full ${row.color} ${row.grad} transition-[width] duration-700`} style={{ width: `${width}%` }} /></div>
            </div>
          )
        })}
      </div>
      <p className="mt-5 border-t border-border/70 pt-4 text-[13px] leading-5 text-muted">{total} finding{total === 1 ? '' : 's'} represented across recent completed inspections.</p>
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
          <div className="flex h-32 flex-col justify-between pb-8 text-right text-[11px] tabular-nums text-muted sm:h-40"><span>{max}</span><span>{Math.round(max / 2)}</span><span>0</span></div>
          <div>
            <div className="relative flex h-32 items-end gap-2 border-b border-border px-2 sm:h-40 sm:gap-4">
              {data.map((item, index) => {
                const height = `${(item.inspections / max) * 100}%`
                const isPeak = item.inspections === peak && peak > 0
                return (
                  <div className="group relative flex h-full flex-1 items-end justify-center" key={item.date}>
                    <span className="pointer-events-none absolute bottom-[calc(var(--bar-height)+0.6rem)] z-10 hidden whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[11px] font-medium text-white shadow-sm group-hover:block group-focus-within:block" style={{ '--bar-height': height } as CSSProperties}>{item.inspections} completed</span>
                    <div tabIndex={0} className={`progress-reveal w-full max-w-9 rounded-t-[6px] transition-[background-color,box-shadow,transform] duration-200 group-hover:-translate-y-0.5 ${isPeak ? 'bg-brand grad-column' : 'bg-ink/[0.8] group-hover:bg-brand'}`} style={{ height, animationDelay: `${index * 45}ms` }} role="img" aria-label={`${item.date}: ${item.inspections} completed inspections`} />
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
  if (!counts.total) return <div className="space-y-8"><div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md"><OverviewHeader data={data} onNewInspection={openNewInspection} /></div><Card className="py-16 text-center"><p className="text-lg font-semibold text-ink">No inspections yet</p><p className="mt-1 text-sm text-muted">Create your first inspection to begin.</p><Button className="mt-5" onClick={openNewInspection}><PlusIcon /> New Inspection</Button></Card></div>

  return (
    <div className="space-y-5 sm:space-y-6">
      <Reveal>
        <section aria-label="Inspection overview" className="overflow-hidden rounded-2xl border border-border bg-surface shadow-md transition-shadow duration-200 hover:shadow-lg">
          <OverviewHeader data={data} onNewInspection={openNewInspection} />
          <KpiLedger data={data} />
        </section>
      </Reveal>
      <Reveal delay={60}>
        <div className="grid items-start gap-5 sm:gap-6 xl:grid-cols-[minmax(0,13fr)_minmax(0,7fr)]">
          <ComplianceOverview data={data} />
          <SeverityInsight counts={data.openFindingsBySeverity} />
        </div>
      </Reveal>
      <Reveal delay={120}>
        <ActivityChart data={data.activity} />
      </Reveal>
    </div>
  )
}
