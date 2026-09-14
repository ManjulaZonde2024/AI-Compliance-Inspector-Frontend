import { inspectionEvidenceMock, inspectionResultMock } from './result'
import type { InspectionReport } from '../types'

export const inspectionReportMock: InspectionReport = {
  result: inspectionResultMock,
  evidence: inspectionEvidenceMock,
  generatedAt: '2026-09-08T10:04:00Z',
  reportStatus: 'Generated',
  reportVersion: 'Draft 1.0',
}
