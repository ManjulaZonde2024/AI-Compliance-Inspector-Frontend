import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LoadingState, Skeleton } from '../components/ui/LoadingState'
import { historyService } from '../services'
import type { ComplianceStatus, FindingSeverity, HistoryInspection, InspectionHistory } from '../types'

type StatusFilter = 'all' | ComplianceStatus
type SeverityFilter = 'all' | FindingSeverity
type SortOrder = 'newest' | 'oldest'
/** Compact density: more rows per screen without crowding the table. */
const pageSize = 8
const statusDetails: Record<ComplianceStatus, { label: string; tone: 'success' | 'danger' }> = { compliant: { label: 'Compliant', tone: 'success' }, 'non-compliant': { label: 'Non-compliant', tone: 'danger' } }
function formatDate(value: string) { return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) }
/** Inline toolbar select — label carried by aria so controls stay one row tall.
 *  Non-default values get a clear active (plum-tinted) selection state. */
function FieldSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  const active = value !== 'all' && value !== 'newest'
  return (
    <select
      aria-label={label}
      title={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`h-8 w-full rounded-md border px-2 text-[13px] font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:w-auto ${active ? 'border-brand/45 bg-brand-light/60 text-ink shadow-sm' : 'border-border bg-surface text-ink hover:border-navy-line/40'}`}
    >
      {children}
    </select>
  )
}
const dateFieldClass = 'h-8 w-full rounded-md border border-border bg-surface px-2 text-[13px] text-ink transition-colors hover:border-navy-line/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:w-auto'
function StatusBadge({ status }: { status: ComplianceStatus }) { const detail = statusDetails[status]; return <Badge tone={detail.tone}>{detail.label}</Badge> }
function FindingsCell({ record }: { record: HistoryInspection }) { return <span className="text-[12px] text-ink">{record.findingCount} finding{record.findingCount === 1 ? '' : 's'}{record.highestSeverity ? ` · ${record.highestSeverity[0].toUpperCase()}${record.highestSeverity.slice(1)}` : ''}</span> }

export function HistoryPage() {
  const navigate = useNavigate()
  const [history, setHistory] = useState<InspectionHistory | null>(null)
  const [failed, setFailed] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [severity, setSeverity] = useState<SeverityFilter>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [page, setPage] = useState(1)
  const loadHistory = () => { setFailed(false); historyService.getInspectionHistory().then(setHistory, () => setFailed(true)) }
  useEffect(() => { historyService.getInspectionHistory().then(setHistory, () => setFailed(true)) }, [])
  const categories = useMemo(() => Array.from(new Set(history?.inspections.map((item) => item.category).filter(Boolean))).sort(), [history])
  const records = useMemo(() => { if (!history) return []; const query = search.trim().toLowerCase(); return history.inspections.filter((item) => { const date = new Date(item.inspectedAt).getTime(); const from = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : -Infinity; const to = toDate ? new Date(`${toDate}T23:59:59`).getTime() : Infinity; return (!query || `${item.productName} ${item.inspectionId}`.toLowerCase().includes(query)) && (category === 'all' || item.category === category) && (status === 'all' || item.status === status) && (severity === 'all' || item.highestSeverity === severity) && date >= from && date <= to }).sort((a, b) => sortOrder === 'newest' ? new Date(b.inspectedAt).getTime() - new Date(a.inspectedAt).getTime() : new Date(a.inspectedAt).getTime() - new Date(b.inspectedAt).getTime()) }, [category, fromDate, history, search, severity, sortOrder, status, toDate])
  const pageCount = Math.max(1, Math.ceil(records.length / pageSize))
  const effectivePage = Math.min(page, pageCount)
  const visibleRecords = records.slice((effectivePage - 1) * pageSize, effectivePage * pageSize)
  const filtersActive = Boolean(search || category !== 'all' || status !== 'all' || severity !== 'all' || fromDate || toDate || sortOrder !== 'newest')
  const reset = () => { setSearch(''); setCategory('all'); setStatus('all'); setSeverity('all'); setFromDate(''); setToDate(''); setSortOrder('newest'); setPage(1) }
  if (!history && !failed) return <div className="space-y-4"><LoadingState label="Loading inspection history" /><Skeleton className="h-32" /><Skeleton className="h-96" /></div>
  if (failed || !history) return <Card className="py-12 text-center"><p className="font-semibold text-ink">Inspection history could not be loaded</p><p className="mt-1 text-sm text-muted">Please try again to access previous inspections.</p><Button className="mt-5" variant="secondary" onClick={loadHistory}>Try again</Button></Card>

  return (
    <div className="space-y-2">
      <PageHeader title="Inspection History" actions={<Button className="cta-grad" onClick={() => navigate('/inspections/new')}>New inspection <span aria-hidden>→</span></Button>} />

      {history.inspections.length === 0 ? (
        <Card className="py-14 text-center">
          <p className="font-semibold text-ink">No inspections yet</p>
          <p className="mt-1 text-sm text-muted">Start an inspection to create a review record for this workspace.</p>
          <Button className="mt-5" onClick={() => navigate('/inspections/new')}>New inspection</Button>
        </Card>
      ) : (
        <>
          {/* Compact toolbar: search always visible, filters inline on desktop,
              collapsed into a popover on mobile. */}
          <Card className="p-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full min-w-0 md:w-auto md:min-w-[12rem] md:flex-1">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.6" /><path d="m10.4 10.4 3 3" /></svg>
                </span>
                <input
                  type="search"
                  aria-label="Search inspections"
                  placeholder="Search inspections"
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setPage(1) }}
                  className="h-8 w-full rounded-md border border-border bg-surface pl-8 pr-3 text-[13px] text-ink placeholder:text-muted transition-colors duration-150 hover:border-brand/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                />
              </div>
              <div className="hidden items-center gap-2 md:flex">
                <FieldSelect label="Filter by category" value={category} onChange={(value) => { setCategory(value); setPage(1) }}>
                  <option value="all">All categories</option>
                  {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                </FieldSelect>
                <FieldSelect label="Filter by status" value={status} onChange={(value) => { setStatus(value as StatusFilter); setPage(1) }}>
                  <option value="all">All statuses</option>
                  <option value="compliant">Compliant</option>
                  <option value="non-compliant">Non-compliant</option>
                </FieldSelect>
                <FieldSelect label="Filter by severity" value={severity} onChange={(value) => { setSeverity(value as SeverityFilter); setPage(1) }}>
                  <option value="all">All severities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </FieldSelect>
                <FieldSelect label="Sort order" value={sortOrder} onChange={(value) => { setSortOrder(value as SortOrder); setPage(1) }}>
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                </FieldSelect>
                <input type="date" aria-label="From date" title="From date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1) }} className={dateFieldClass} />
                <input type="date" aria-label="To date" title="To date" value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(1) }} className={dateFieldClass} />
                <Button variant="ghost" size="sm" disabled={!filtersActive} onClick={reset}>Reset</Button>
              </div>
              <details className="relative md:hidden">
                <summary className="flex h-8 cursor-pointer list-none items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-[13px] font-semibold text-ink transition-colors hover:border-brand/40 [&::-webkit-details-marker]:hidden">
                  Filters
                  {filtersActive ? <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden /> : null}
                </summary>
                <div className="absolute right-0 z-30 mt-1.5 grid w-56 gap-2 rounded-lg border border-border bg-surface p-2 shadow-lg">
                  <FieldSelect label="Filter by category" value={category} onChange={(value) => { setCategory(value); setPage(1) }}>
                    <option value="all">All categories</option>
                    {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                  </FieldSelect>
                  <FieldSelect label="Filter by status" value={status} onChange={(value) => { setStatus(value as StatusFilter); setPage(1) }}>
                    <option value="all">All statuses</option>
                    <option value="compliant">Compliant</option>
                    <option value="non-compliant">Non-compliant</option>
                  </FieldSelect>
                  <FieldSelect label="Filter by severity" value={severity} onChange={(value) => { setSeverity(value as SeverityFilter); setPage(1) }}>
                    <option value="all">All severities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </FieldSelect>
                  <FieldSelect label="Sort order" value={sortOrder} onChange={(value) => { setSortOrder(value as SortOrder); setPage(1) }}>
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </FieldSelect>
                  <input type="date" aria-label="From date" value={fromDate} onChange={(event) => { setFromDate(event.target.value); setPage(1) }} className={dateFieldClass} />
                  <input type="date" aria-label="To date" value={toDate} onChange={(event) => { setToDate(event.target.value); setPage(1) }} className={dateFieldClass} />
                  <Button variant="ghost" size="sm" disabled={!filtersActive} onClick={reset} className="justify-self-end">Reset</Button>
                </div>
              </details>
            </div>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
            <p className="text-xs text-muted">
              Showing {records.length ? (effectivePage - 1) * pageSize + 1 : 0}–{Math.min(effectivePage * pageSize, records.length)} of {records.length} inspections
            </p>
            {filtersActive ? <Badge tone="info">Filters active</Badge> : null}
          </div>

          {visibleRecords.length === 0 ? (
            <Card className="py-14 text-center">
              <p className="font-semibold text-ink">No inspections match your search.</p>
              <Button className="mt-5" variant="secondary" onClick={reset}>Clear search</Button>
            </Card>
          ) : (
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <caption className="sr-only">Inspection history records</caption>
                  <thead className="border-b border-border bg-surface-soft/70 text-[10px] font-semibold uppercase tracking-[0.09em] text-muted">
                    <tr>
                      <th className="px-2.5 py-1.5" scope="col">Product</th>
                      <th className="whitespace-nowrap px-2.5 py-1.5" scope="col">Inspection</th>
                      <th className="whitespace-nowrap px-2.5 py-1.5" scope="col">Completed</th>
                      <th className="whitespace-nowrap px-2.5 py-1.5" scope="col">Status</th>
                      <th className="px-2.5 py-1.5" scope="col">Findings</th>
                      <th className="whitespace-nowrap px-2.5 py-1.5 text-right" scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {visibleRecords.map((record: HistoryInspection) => (
                      <tr key={record.inspectionId} className="transition-colors duration-150 hover:bg-surface-soft hover:shadow-[inset_3px_0_0_var(--color-brand)]">
                        <td className="px-2.5 py-1.5">
                          <p className="truncate text-[13px] font-semibold tracking-[-0.006em] text-ink">{record.productName}</p>
                          <p className="mt-0.5 text-[11px] leading-4 text-muted">{record.category ?? 'Category not returned'}</p>
                        </td>
                        <td className="whitespace-nowrap px-2.5 py-1.5 font-mono text-[11px] text-muted">{record.inspectionId}</td>
                        <td className="whitespace-nowrap px-2.5 py-1.5 text-[12px] text-muted">
                          <time dateTime={record.inspectedAt}>{formatDate(record.inspectedAt)}</time>
                        </td>
                        <td className="whitespace-nowrap px-2.5 py-1.5"><StatusBadge status={record.status} /></td>
                        <td className="px-2.5 py-1.5"><FindingsCell record={record} /></td>
                        <td className="px-2.5 py-1.5">
                          <div className="flex justify-end gap-1.5 whitespace-nowrap">
                            <Button size="sm" variant="secondary" onClick={() => navigate(`/inspections/${record.inspectionId}/result`)}>Result</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs tabular-nums text-muted">Page {effectivePage} of {pageCount}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={effectivePage <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
              <Button size="sm" variant="secondary" disabled={effectivePage >= pageCount} onClick={() => setPage((current) => current + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
