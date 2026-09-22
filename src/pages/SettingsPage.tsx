import { useEffect, useRef, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LoadingState, Skeleton } from '../components/ui/LoadingState'
import { settingsService } from '../services'
import type { RagSettings } from '../types'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

// Temporary demonstration values for the latest-sync summary until the RAG
// backend is integrated. The checked count is derived from the loaded mock
// source count; the remaining figures are static demo values. The backend
// team will replace these behind the existing settingsService boundary.
function latestSyncSummary(indexedSources: number) {
  return [
    { label: 'Rules checked', value: String(indexedSources) },
    { label: 'Rules updated', value: '3' },
    { label: 'New rules', value: '1' },
  ]
}

export function SettingsPage() {
  const [settings, setSettings] = useState<RagSettings | null>(null)
  const [failed, setFailed] = useState(false)
  const [syncing, setSyncing] = useState(false)
  /** Compact inline confirmation shown after a sync check; auto-dismisses. */
  const [message, setMessage] = useState<{ title: string; body: string } | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    settingsService.getRagSettings().then(
      (loaded) => {
        setSettings(loaded)
        setMessage(null)
      },
      () => setFailed(true),
    )
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    }
  }, [])

  const runSynchronization = () => {
    if (syncing) return
    setSyncing(true)
    setMessage(null)

    // Minimal frontend-only mock interaction until the RAG backend is
    // connected: loading state, existing mock data retained, then a
    // result state derived from the existing settings summary. No network
    // requests; the confirmation fades in and auto-dismisses.
    timer.current = window.setTimeout(() => {
      setSyncing(false)
      const summaryItems = latestSyncSummary(settings?.indexedSources ?? 0)
      const updated = summaryItems.find((item) => item.label === 'Rules updated')
      const updates = Number(updated?.value ?? '0')
      setMessage(
        updates > 0
          ? { title: 'Rules updated', body: `${updates} rule update${updates === 1 ? '' : 's'} ${updates === 1 ? 'is' : 'are'} now available.` }
          : { title: 'Rules are up to date', body: 'No new rule updates were found.' },
      )
      timer.current = window.setTimeout(() => setMessage(null), 4500)
    }, 1200)
  }

  if (!settings && !failed) {
    return (
      <div className="space-y-5">
        <LoadingState label="Loading compliance settings" />
        <Skeleton className="h-40" />
        <Skeleton className="h-72" />
      </div>
    )
  }

  if (failed || !settings) {
    return (
      <Card className="py-12 text-center">
        <p className="font-semibold text-ink">Settings could not be loaded</p>
        <p className="mt-1 text-sm text-muted">
          Compliance settings are unavailable right now.
        </p>
        <Button className="mt-5" variant="secondary" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </Card>
    )
  }

  const kbSynced = settings.knowledgeBaseStatus === 'synced'
  const summary = latestSyncSummary(settings.indexedSources)

  return (
    <div className="welcome-enter">
      <PageHeader
        title="Settings"
        description="Knowledge base synchronization and status."
      />

      <p className="mb-4 max-w-3xl text-sm leading-6 text-muted">
        Official Legal Metrology references are synchronized by the connected service, and inspections evaluate against the resulting knowledge base.
      </p>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] [animation-delay:60ms] welcome-enter">
        <Card
          title="Knowledge base status"
          description="Frontend representation of the returned RAG knowledge source state."
        >
          <div
            className={`hover-lift relative mt-4 overflow-hidden rounded-md border p-4 transition-[border-color,box-shadow,transform] duration-200 ${kbSynced ? 'border-success/25 bg-success/5' : 'border-warning/25 bg-warning/5'}`}
          >
            <span
              className={`absolute inset-y-0 left-0 w-1 ${kbSynced ? 'bg-success' : 'bg-warning'}`}
              aria-hidden
            />
            <div className="flex items-start justify-between gap-4 pl-2">
              <div>
                <p className="font-medium text-ink">
                  {kbSynced ? 'Official sources synchronized' : 'Attention required'}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {kbSynced
                    ? 'The knowledge base is available to the inspection workflow.'
                    : 'The connected service reports the knowledge base state needs attention.'}
                </p>
              </div>
              <Badge tone={kbSynced ? 'success' : 'warning'}>
                {kbSynced ? 'Synced' : 'Attention'}
              </Badge>
            </div>
          </div>

          <dl className="mt-3 divide-y divide-border text-sm">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-muted">Last synchronization</dt>
              <dd className="font-medium tabular-nums text-ink">{formatDate(settings.lastRun)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-muted">Indexed sources</dt>
              <dd className="font-medium text-ink">
                {settings.indexedSources} official sources
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-muted">Scope</dt>
              <dd className="font-medium text-ink">Legal Metrology references</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-muted">Automatic refresh</dt>
              <dd className="font-medium text-ink">Once every week</dd>
            </div>
          </dl>
        </Card>

        <div className="flex min-w-0 flex-col gap-4">
          <Card
            title="Latest synchronization"
            description="Summary of changes from the most recent knowledge base refresh."
          >
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {summary.map((item) => (
                <div key={item.label} className="hover-lift rounded-md border border-border bg-bg p-3 transition-[border-color,box-shadow,transform] duration-200 hover:border-brand/30">
                  <span className="plum-accent mb-2 block h-1 w-6 rounded-full opacity-80" aria-hidden />
                  <p className="text-2xl font-semibold tabular-nums text-ink">{item.value}</p>
                  <p className="mt-1 text-xs text-muted">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              Latest synchronization completed successfully. The knowledge base
              reflects the most recent official source refresh.
            </p>
          </Card>

          <Card
            title="Manual synchronization"
            description="Refresh the Legal Metrology knowledge base using the latest available official sources."
          >
            <div className="mt-4 rounded-md border border-border bg-bg p-3">
              <p className="font-medium text-ink">Automatic synchronization</p>
              <p className="mt-1 text-sm text-muted">
                The knowledge base is refreshed automatically once every week.
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                {syncing ? 'Checking for updates…' : 'Check for rule updates'}
              </p>
              <Button className="cta-grad" onClick={runSynchronization} disabled={syncing}>
                {syncing ? 'Checking for updates…' : 'Check for rule updates'}
              </Button>
            </div>
            {message ? (
              <div className="toast-in mt-3 flex items-start gap-2.5 rounded-lg border border-success/25 bg-surface px-3 py-2.5 shadow-md" role="status">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-white" aria-hidden>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="m2.5 6.3 2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-ink">{message.title}</p>
                  <p className="text-[13px] leading-5 text-muted">{message.body}</p>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </div>

      <Card
        className="mt-4 welcome-enter [animation-delay:120ms]"
        title="Legal Metrology sources"
        description="The connected knowledge workflow is intended to use official references. This interface does not scrape or update sources."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="hover-lift rounded-md border border-border bg-bg p-3.5 transition-[border-color,box-shadow,transform] duration-200 hover:border-brand/30">
            <p className="font-medium text-ink">Official references</p>
            <p className="mt-1 text-sm text-muted">Packaged commodity guidance</p>
          </div>
          <div className="hover-lift rounded-md border border-border bg-bg p-3.5 transition-[border-color,box-shadow,transform] duration-200 hover:border-brand/30">
            <p className="font-medium text-ink">Source status</p>
            <p className="mt-1 text-sm text-success">Available for review</p>
          </div>
          <div className="hover-lift rounded-md border border-border bg-bg p-3.5 transition-[border-color,box-shadow,transform] duration-200 hover:border-brand/30">
            <p className="font-medium text-ink">Synchronization managed by</p>
            <p className="mt-1 text-sm font-medium text-ink">Connected service</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
