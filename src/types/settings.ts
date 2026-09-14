export type SchedulerFrequency = '6-hours' | '12-hours' | 'daily' | 'weekly'

export type RagSettings = {
  enabled: boolean
  frequency: SchedulerFrequency
  lastRun: string
  nextRun: string
  indexedSources: number
  knowledgeBaseStatus: 'synced' | 'attention'
}