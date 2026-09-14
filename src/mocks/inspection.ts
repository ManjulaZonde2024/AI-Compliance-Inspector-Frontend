import type { CreateInspectionResult } from '../types/inspection'

export function createInspectionMockResult(): CreateInspectionResult {
  const sequence = Math.floor(1000 + Math.random() * 9000)
  return { inspectionId: `INSP-2026-${sequence}` }
}
