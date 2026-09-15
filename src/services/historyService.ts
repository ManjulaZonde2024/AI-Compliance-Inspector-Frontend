import { inspectionRepository } from './inspectionRepository'
import type { InspectionHistory } from '../types/history'

/** History data boundary; replace with a server-backed query when available. */
export const historyService = {
  async getInspectionHistory(): Promise<InspectionHistory> {
    return Promise.resolve({ inspections: (await inspectionRepository.list()).filter((record) => record.complianceStatus).map((record) => ({ inspectionId: record.inspectionId, productName: record.productName, category: record.category || undefined, inspectedAt: record.inspectedAt ?? record.createdAt, status: record.complianceStatus!, findingCount: record.findings.length, highestSeverity: record.findings.reduce((highest, finding) => ({ high: 3, medium: 2, low: 1 }[finding.severity] > ({ high: 3, medium: 2, low: 1 }[highest ?? 'low'] ?? 0) ? finding.severity : highest), undefined as 'high' | 'medium' | 'low' | undefined), findingSummary: record.findings.length ? `${record.findings.length} finding${record.findings.length === 1 ? '' : 's'} · ${record.findings.reduce((highest, finding) => ({ high: 3, medium: 2, low: 1 }[finding.severity] > ({ high: 3, medium: 2, low: 1 }[highest ?? 'low'] ?? 0) ? finding.severity : highest), undefined as 'high' | 'medium' | 'low' | undefined)}` : '0 findings' })) })
  },
}
