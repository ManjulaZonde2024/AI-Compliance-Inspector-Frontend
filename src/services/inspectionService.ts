import { createInspectionMockResult } from '../mocks/inspection'
import { inspectionRepository } from './inspectionRepository'
import type { CreateInspectionInput, CreateInspectionResult } from '../types/inspection'

/** Intake data boundary; replace with the inspection API once its contract exists. */
export const inspectionService = {
  createInspection(input: CreateInspectionInput): Promise<CreateInspectionResult> {
    const result = createInspectionMockResult()
    return inspectionRepository.create(input, result.inspectionId).then(() => result)
  },
}
