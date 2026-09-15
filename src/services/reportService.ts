import type { InspectionReport } from '../types'
import { inspectionRepository } from './inspectionRepository'

const simulateExport = (): Promise<void> =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(), 700)
  })

export const reportService = {
  async getReport(inspectionId: string): Promise<InspectionReport> {
    const record = await inspectionRepository.get(inspectionId)
    if (!record || !record.complianceStatus) return Promise.reject(new Error('Inspection report not found'))
    return Promise.resolve({ result: { inspectionId: record.inspectionId, productName: record.productName, category: record.category || undefined, inspectedAt: record.inspectedAt, status: record.complianceStatus, score: record.complianceScore, summary: record.summary ?? 'No summary was returned for this inspection.', findings: record.findings }, evidence: record.evidence, generatedAt: new Date().toISOString(), reportStatus: record.reportStatus, reportVersion: record.reportVersion })
  },

  downloadReportPdf(_inspectionId: string): Promise<void> {
    return simulateExport()
  },

  exportReportEditable(_inspectionId: string): Promise<void> {
    return simulateExport()
  },
}