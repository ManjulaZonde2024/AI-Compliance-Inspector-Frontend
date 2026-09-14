import { ragSettingsMock } from '../mocks/settings'
import type { RagSettings } from '../types'

const settingsKey = 'ai-compliance-inspector.settings.v1'

export const settingsService = {
  getRagSettings(): Promise<RagSettings> {
    try {
      const stored = localStorage.getItem(settingsKey)
      if (stored) return Promise.resolve(JSON.parse(stored) as RagSettings)
    } catch {
      return Promise.resolve(ragSettingsMock)
    }
    localStorage.setItem(settingsKey, JSON.stringify(ragSettingsMock))
    return Promise.resolve(ragSettingsMock)
  },
  saveRagSettings(settings: RagSettings): Promise<RagSettings> {
    return new Promise((resolve) => window.setTimeout(() => { localStorage.setItem(settingsKey, JSON.stringify(settings)); resolve(settings) }, 500))
  },
}