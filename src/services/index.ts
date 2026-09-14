/**
 * API clients belong here. Components should call this layer, not fetch().
 * Swap mock implementations for real HTTP clients later without rewriting UI.
 */
export type ApiClientConfig = {
  baseUrl: string
}

export { dashboardService } from './dashboardService'
export { evidenceService } from './evidenceService'
export { inspectionService } from './inspectionService'
export { reportService } from './reportService'
export { resultService } from './resultService'
export { imageCheckerService, scanService } from './scanService'
export { historyService } from './historyService'
export { settingsService } from './settingsService'
export { inspectionRepository } from './inspectionRepository'
