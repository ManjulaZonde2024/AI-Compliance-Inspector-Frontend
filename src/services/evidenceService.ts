import type { InspectionEvidence } from '../types'
import { inspectionRepository } from './inspectionRepository'

export const evidenceService = {
  getEvidence(inspectionId: string): Promise<InspectionEvidence[]> {
    const record = inspectionRepository.get(inspectionId)
    if (!record) return Promise.reject(new Error('Inspection not found'))
    return Promise.resolve(record.evidence)
  },
}