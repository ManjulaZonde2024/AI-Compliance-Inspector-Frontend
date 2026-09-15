import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { LoadingState, Skeleton } from '../components/ui/LoadingState'
import { settingsService } from '../services'
import type { RagSettings, SchedulerFrequency } from '../types'

const frequencyLabels: Record<SchedulerFrequency, string> = {
  '6-hours': 'Every 6 hours',
  '12-hours': 'Every 12 hours',
  daily: 'Daily',
  weekly: 'Weekly',
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function SettingsPage() {
  const [settings, setSettings] = useState<RagSettings | null>(null)
  const [savedSettings, setSavedSettings] = useState<RagSettings | null>(null)
  const [failed, setFailed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null)

  useEffect(() => {
    settingsService.getRagSettings().then(
      (loaded) => {
        setSettings(loaded)
        setSavedSettings(loaded)
        setMessage(null)
      },
      () => setFailed(true),
    )
  }, [])

  const isDirty = useMemo(() => {
    if (!settings || !savedSettings) return false
    return JSON.stringify(settings) !== JSON.stringify(savedSettings)
  }, [savedSettings, settings])

  const save = () => {
    if (!settings || saving) return
    setSaving(true)
    setMessage(null)

    settingsService
      .saveRagSettings(settings)
      .then(
        (saved) => {
          setSettings(saved)
          setSavedSettings(saved)
          setMessage({ tone: 'success', text: 'Scheduler configuration saved.' })
        },
        () => {
          setMessage({
            tone: 'danger',
            text: 'Configuration could not be saved. Please try again.',
          })
        },
      )
      .finally(() => setSaving(false))
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

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage Legal Metrology knowledge-base synchronization and update schedules."
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
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
          </dl>
        </Card>

        <Card
          title="Knowledge-base synchronization"
          description="Configure when the knowledge base refresh should be requested. Scheduling is handled by the connected backend service."
        >
          <div className="mt-5 flex items-center justify-between rounded-md border border-border bg-bg p-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-ink">Enable scheduler</p>
                <Badge tone={settings.enabled ? 'success' : 'default'}>
                  {settings.enabled ? 'On' : 'Off'}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted">
                Allow scheduled source synchronization requests.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.enabled}
              aria-label="Enable scheduler"
              aria-describedby="scheduler-state-note"
              onClick={() => {
                setSettings({ ...settings, enabled: !settings.enabled })
                setMessage(null)
              }}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                settings.enabled ? 'bg-brand' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  settings.enabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          <p
            id="scheduler-state-note"
            className={`mt-3 rounded-md border px-3 py-2.5 text-sm ${
              settings.enabled
                ? 'border-brand/25 bg-brand-light/60 text-ink'
                : 'border-border bg-bg text-muted'
            }`}
          >
            {settings.enabled
              ? `Scheduling is on. The connected service is configured to refresh ${frequencyLabels[settings.frequency].toLowerCase()}.`
              : 'Scheduling is off. The knowledge base will not refresh automatically until the scheduler is enabled and changes are saved.'}
          </p>

          <label className="mt-5 flex flex-col gap-1.5 text-sm font-medium text-ink">
            Frequency
            <select
              value={settings.frequency}
              onChange={(event) => {
                setSettings({
                  ...settings,
                  frequency: event.target.value as SchedulerFrequency,
                })
                setMessage(null)
              }}
              className="h-10 rounded-md border border-border bg-surface px-3 text-sm font-normal text-ink focus-visible:outline-2 focus-visible:outline-brand"
            >
              {Object.entries(frequencyLabels).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-border p-3">
              <p className="text-xs text-muted">Last successful run</p>
              <p className="mt-1 text-sm font-medium text-ink">
                {formatDate(settings.lastRun)}
              </p>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-xs text-muted">Next scheduled run</p>
              {settings.enabled ? (
                <p className="mt-1 text-sm font-medium text-ink">
                  {formatDate(settings.nextRun)}
                </p>
              ) : (
                <>
                  <p className="mt-1 text-sm font-medium text-muted">Not scheduled</p>
                  <p className="mt-0.5 text-xs text-muted">
                    Scheduling is off — no run is planned.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted">
              {saving ? 'Saving…' : isDirty ? 'Unsaved changes' : message?.tone === 'success' ? '✓ Changes saved' : 'Saved'}
            </div>
            <Button onClick={save} disabled={saving || !isDirty}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </Card>
      </div>

      <Card
        className="mt-6"
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
