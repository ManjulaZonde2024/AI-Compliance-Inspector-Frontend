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
  const [message, setMessage] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null)
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
    // success state. No network requests.
    timer.current = window.setTimeout(() => {
      setSyncing(false)
      setMessage({
        tone: 'success',
        text: 'Synchronization completed successfully. The knowledge base reflects the most recent official source refresh.',
      })
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
    <div>
      <PageHeader
        title="Settings"
        description="Knowledge base synchronization and status."
      />

      <p className="mb-5 max-w-3xl text-sm leading-6 text-muted">
        Official Legal Metrology references are synchronized by the connected service, and inspections evaluate against the resulting knowledge base.
      </p>

      {message ? (
        <div
          className={`mb-5 rounded-md border px-4 py-3 text-sm ${
            message.tone === 'success'
              ? 'border-success/25 bg-success/10 text-success'
              : 'border-danger/25 bg-danger/5 text-danger'
          }`}
          role={message.tone === 'success' ? 'status' : 'alert'}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Card
          title="Knowledge base status"
          description="Frontend representation of the returned RAG knowledge source state."
        >
          <div
            className={`relative mt-5 overflow-hidden rounded-md border p-4 ${kbSynced ? 'border-success/25 bg-success/5' : 'border-warning/25 bg-warning/5'}`}
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

          <dl className="mt-4 divide-y divide-border text-sm">
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-muted">Last synchronization</dt>
              <dd className="font-medium text-ink">{formatDate(settings.lastRun)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-muted">Indexed sources</dt>
              <dd className="font-medium text-ink">
                {settings.indexedSources} official sources
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-muted">Scope</dt>
              <dd className="font-medium text-ink">Legal Metrology references</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-muted">Automatic refresh</dt>
              <dd className="font-medium text-ink">Once every week</dd>
            </div>
          </dl>
        </Card>

        <div className="flex min-w-0 flex-col gap-5">
          <Card
            title="Latest synchronization"
            description="Summary of changes from the most recent knowledge base refresh."
          >
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {summary.map((item) => (
                <div key={item.label} className="rounded-md border border-border bg-bg p-3">
                  <p className="text-2xl font-semibold text-ink">{item.value}</p>
                  <p className="mt-1 text-xs text-muted">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              Latest synchronization completed successfully. The knowledge base
              reflects the most recent official source refresh.
            </p>
          </Card>

          <Card
            title="Manual synchronization"
            description="Refresh the Legal Metrology knowledge base using the latest available official sources."
          >
            <div className="mt-5 rounded-md border border-border bg-bg p-4">
              <p className="font-medium text-ink">Automatic synchronization</p>
              <p className="mt-1 text-sm text-muted">
                The knowledge base is refreshed automatically once every week.
              </p>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted">
                {syncing ? 'Checking for updates…' : 'Check for rule updates'}
              </p>
              <Button onClick={runSynchronization} disabled={syncing}>
                {syncing ? 'Checking for updates…' : 'Check for rule updates'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Card
        className="mt-5"
        title="Legal Metrology sources"
        description="The connected knowledge workflow is intended to use official references. This interface does not scrape or update sources."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-bg p-4">
            <p className="font-medium text-ink">Official references</p>
            <p className="mt-1 text-sm text-muted">Packaged commodity guidance</p>
          </div>
          <div className="rounded-md border border-border bg-bg p-4">
            <p className="font-medium text-ink">Source status</p>
            <p className="mt-1 text-sm text-success">Available for review</p>
          </div>
          <div className="rounded-md border border-border bg-bg p-4">
            <p className="font-medium text-ink">Synchronization managed by</p>
            <p className="mt-1 text-sm font-medium text-ink">Connected service</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
