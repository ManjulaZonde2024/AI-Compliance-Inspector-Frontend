import type { ComplianceStatus, FindingSeverity } from './inspection'

export type HistoryInspection = {
  inspectionId: string
  productName: string
  category?: string
  inspectedAt: string
  status: ComplianceStatus
  findingCount: number
  highestSeverity?: FindingSeverity
  findingSummary?: string
}

export type InspectionHistory = {
  inspections: HistoryInspection[]
}
