import { fallbackScanContext, scanStageFixtures } from '../mocks/scan'
import { buildInspectionResultData } from '../mocks/result'
import { inspectionRepository } from './inspectionRepository'
import type { ScanInspectionContext, ScanSnapshot } from '../types/scan'

export type ImageCheckResult = { accepted: boolean; reason?: 'blurry' | 'duplicate' | 'irrelevant'; imageCount: number }

export const imageCheckerService = {
  /*
    const record = inspectionRepository.get(inspectionId)
    const rejectedImage = record?.images.find((image) => /blurry|duplicate|irrelevant/i.test(image.name))
    const reason = rejectedImage?.name.match(/blurry|duplicate|irrelevant/i)?.[0].toLowerCase() as ImageCheckResult['reason'] | undefined
*/
  async checkImages(inspectionId: string): Promise<ImageCheckResult> {
    const record = await inspectionRepository.get(inspectionId)
    const rejectedImage = record?.images.find((image) => /blurry|duplicate|irrelevant/i.test(image.name))
    const reason = rejectedImage?.name.match(/blurry|duplicate|irrelevant/i)?.[0].toLowerCase() as ImageCheckResult['reason'] | undefined
    return { accepted: Boolean(record?.images.length) && !rejectedImage, reason, imageCount: record?.images.length ?? 0 }
  },
}

function createSnapshot(inspectionId: string, context: ScanInspectionContext, attempt: number): ScanSnapshot {
  return {
    inspectionId,
    status: 'processing',
    attempt,
    context,
    stages: scanStageFixtures.map((stage, index) => ({ ...stage, state: index === 0 ? 'active' : 'pending' })),
  }
}

/** Presentation-only scan state boundary. A future API can replace these methods. */
export const scanService = {
  /*
    const record = inspectionRepository.get(inspectionId)
    if (!record) return Promise.reject(new Error('Inspection not found'))
    const recordContext: ScanInspectionContext = { productName: record.productName, category: record.category, images: record.images.map((image) => ({ previewUrl: image.previewUrl, role: image.role })) }
    inspectionRepository.setProcessingStatus(inspectionId, 'submitted')
*/
  async getInitialScan(inspectionId: string, context?: ScanInspectionContext): Promise<ScanSnapshot> {
    const record = await inspectionRepository.get(inspectionId)
    if (!record) return Promise.reject(new Error('Inspection not found'))
    const recordContext: ScanInspectionContext = { productName: record.productName, category: record.category, images: record.images.map((image) => ({ previewUrl: image.previewUrl, role: image.role })) }
    await inspectionRepository.setProcessingStatus(inspectionId, 'submitted')
    return imageCheckerService.checkImages(inspectionId).then(async (check) => { if (check.accepted) return createSnapshot(inspectionId, recordContext ?? context ?? fallbackScanContext, 1); const errorMessage = `The submitted images were rejected by the image-check adapter as ${check.reason ?? 'not suitable'}. Replace them and scan again.`; await inspectionRepository.setProcessingStatus(inspectionId, 'failed', errorMessage); const rejectedSnapshot = createSnapshot(inspectionId, recordContext, 1); return { ...rejectedSnapshot, status: 'failed', errorMessage, stages: rejectedSnapshot.stages.map((stage, index) => ({ ...stage, state: index === 0 ? 'failed' : stage.state })) } })
  },
  async advanceScan(snapshot: ScanSnapshot): Promise<ScanSnapshot> {
    const activeIndex = snapshot.stages.findIndex((stage) => stage.state === 'active')
    if (activeIndex === -1 || snapshot.status !== 'processing') return Promise.resolve(snapshot)
    const shouldFail = snapshot.inspectionId.endsWith('-FAIL') && snapshot.attempt === 1 && activeIndex === 2
    if (shouldFail) {
      return Promise.resolve({ ...snapshot, status: 'failed', errorMessage: 'The submitted images could not be processed as a complete inspection. Please try again.', stages: snapshot.stages.map((stage, index) => ({ ...stage, state: index === activeIndex ? 'failed' : stage.state })) })
    }
    const completed = activeIndex === snapshot.stages.length - 1
    const stages: ScanSnapshot['stages'] = snapshot.stages.map((stage, index) => ({ ...stage, state: index < activeIndex + 1 ? 'completed' : index === activeIndex + 1 ? 'active' : 'pending' }))
    if (completed) {
      const record = await inspectionRepository.get(snapshot.inspectionId)
      if (record) {
        // Bind the mock/dev result payload to THIS inspection's own product,
        // category, and submitted images so Result/Evidence/Report stay
        // internally consistent for the same inspection ID.
        const resultData = buildInspectionResultData(record)
        await inspectionRepository.update(snapshot.inspectionId, { processingStatus: 'completed', inspectedAt: new Date().toISOString(), complianceStatus: resultData.status, complianceScore: resultData.score, summary: resultData.summary, findings: resultData.findings, evidence: resultData.evidence, reportStatus: 'Generated', reportVersion: 'Draft 1.0' })
      }
    } else await inspectionRepository.setProcessingStatus(snapshot.inspectionId, 'processing')
    return Promise.resolve({ ...snapshot, status: completed ? 'completed' : 'processing', stages })
  },
  async retryScan(snapshot: ScanSnapshot): Promise<ScanSnapshot> {
    await inspectionRepository.setProcessingStatus(snapshot.inspectionId, 'processing')
    return Promise.resolve(createSnapshot(snapshot.inspectionId, snapshot.context, snapshot.attempt + 1))
  },
}
