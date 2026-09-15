import { inspectionRepository } from './inspectionRepository'
import type { InspectionResult } from '../types'

export const resultService = {
  async getResult(inspectionId: string): Promise<InspectionResult> {
    const record = await inspectionRepository.get(inspectionId)
    if (!record || !record.complianceStatus) return Promise.reject(new Error('Inspection result not found'))
    return Promise.resolve({ inspectionId: record.inspectionId, productName: record.productName, category: record.category || undefined, inspectedAt: record.inspectedAt, status: record.complianceStatus, score: record.complianceScore, summary: record.summary ?? 'No summary was returned for this inspection.', findings: record.findings })
  },
}