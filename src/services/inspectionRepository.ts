import { inspectionEvidenceMock, inspectionResultMock } from '../mocks/result'
import { inspectionHistoryMock } from '../mocks/history'
import type { CreateInspectionInput, InspectionRecord, InspectionImage, InspectionProcessingStatus, InspectionResultData, ProductCategory } from '../types'

// v2: re-seed dev data so inspections scanned before the evidence-source fix
// (which stored another product's mock evidence) are not served stale.
const storageKey = 'ai-compliance-inspector.inspections.v2'

// The v1 → v2 storage-key bump left the old inspections blob in place. Nothing
// reads it anymore, but it keeps consuming origin localStorage quota.
const legacyStorageKey = 'ai-compliance-inspector.inspections.v1'

// Removes the obsolete v1 blob at most once per session, on the first
// repository read, so the quota is reclaimed whether or not the v2 store
// already contains records.
let legacyStorageCleaned = false

function cleanupLegacyStorage(): void {
  if (legacyStorageCleaned) return
  legacyStorageCleaned = true
  try { localStorage.removeItem(legacyStorageKey) } catch { /* removal is best effort; never block repository reads. */ }
}

function seedRecords(): InspectionRecord[] {
  const findingRecord = (inspectionId: string, productName: string, category: ProductCategory | '', inspectedAt: string, status: InspectionRecord['complianceStatus'], findingCount: number, severity: InspectionRecord['findings'][number]['severity'] | undefined): InspectionRecord => ({
    inspectionId, productName, category, brand: '', sku: '', notes: '', images: [], createdAt: inspectedAt, inspectedAt, processingStatus: 'completed', complianceStatus: status, complianceScore: inspectionId === inspectionResultMock.inspectionId ? inspectionResultMock.score : undefined, summary: inspectionId === inspectionResultMock.inspectionId ? inspectionResultMock.summary : findingCount ? 'Returned findings were detected during automated evaluation.' : 'No material findings were returned for this inspection.', findings: inspectionId === inspectionResultMock.inspectionId ? inspectionResultMock.findings : severity ? Array.from({ length: findingCount }, (_, index) => ({ id: `${inspectionId}-finding-${index + 1}`, title: `Finding ${index + 1} detected`, severity, explanation: 'A finding was returned by automated evaluation.' })) : [], evidence: inspectionId === inspectionResultMock.inspectionId ? inspectionEvidenceMock : [], reportStatus: 'Generated', reportVersion: 'Draft 1.0'
  })
  return inspectionHistoryMock.inspections.map((item) => findingRecord(item.inspectionId, item.productName, (item.category ?? '') as ProductCategory | '', item.inspectedAt, item.status, item.findingCount, item.highestSeverity)).map((record) => record.inspectionId === inspectionResultMock.inspectionId ? { ...record, productName: inspectionResultMock.productName, category: inspectionResultMock.category as ProductCategory, findings: inspectionResultMock.findings, evidence: inspectionEvidenceMock, complianceScore: inspectionResultMock.score, summary: inspectionResultMock.summary } : record)
}

function readRecords(): InspectionRecord[] {
  cleanupLegacyStorage()
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) return (JSON.parse(raw) as InspectionRecord[]).map((record) => ({
      ...record,
      complianceStatus: record.complianceStatus ? (record.complianceStatus === 'compliant' ? 'compliant' : 'non-compliant') : undefined,
    }))
  } catch {
    return seedRecords()
  }
  const records = seedRecords()
  writeRecords(records)
  return records
}

function writeRecords(records: InspectionRecord[]) {
  // Genuine persistence failures (e.g. localStorage quota exceeded) must
  // propagate so callers never treat an unpersisted record as saved.
  localStorage.setItem(storageKey, JSON.stringify(records))
}

// Files are persisted inline as data URLs, so large originals would quickly
// exceed the localStorage quota (the whole record list is rewritten on every
// save). Small files keep the exact readAsDataURL output; larger images are
// decoded, downscaled proportionally (longest side <= 1280px) and re-encoded
// as JPEG. Any decode/canvas failure falls back to the original output.
const inlineImageByteLimit = 300 * 1024
const maxPersistedImageSide = 1280
const persistedJpegQuality = 0.85

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function fileToDataUrl(file: File): Promise<string> {
  if (file.size <= inlineImageByteLimit) return readAsDataUrl(file)
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    try {
      const scale = Math.min(1, maxPersistedImageSide / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(bitmap.width * scale))
      canvas.height = Math.max(1, Math.round(bitmap.height * scale))
      const context = canvas.getContext('2d')
      if (!context) return readAsDataUrl(file)
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      const compressed = canvas.toDataURL('image/jpeg', persistedJpegQuality)
      return compressed.startsWith('data:image') ? compressed : readAsDataUrl(file)
    } finally {
      bitmap.close()
    }
  } catch {
    return readAsDataUrl(file)
  }
}

export const inspectionRepository = {
  list(): InspectionRecord[] { return readRecords() },
  get(inspectionId: string): InspectionRecord | undefined { return readRecords().find((record) => record.inspectionId === inspectionId) },
  getResultData(inspectionId: string): InspectionResultData | undefined {
    const record = this.get(inspectionId)
    if (!record || !record.complianceStatus) return undefined
    return {
      inspectionId: record.inspectionId,
      productName: record.productName,
      category: record.category || undefined,
      inspectedAt: record.inspectedAt,
      status: record.complianceStatus,
      score: record.complianceScore,
      summary: record.summary ?? 'No summary was returned for this inspection.',
      findings: record.findings,
      evidence: record.evidence,
    }
  },
  save(record: InspectionRecord): InspectionRecord { const records = readRecords().filter((item) => item.inspectionId !== record.inspectionId); writeRecords([record, ...records]); return record },
  update(inspectionId: string, patch: Partial<InspectionRecord>): InspectionRecord | undefined { const record = this.get(inspectionId); if (!record) return undefined; return this.save({ ...record, ...patch }) },
  async create(input: CreateInspectionInput, inspectionId: string): Promise<InspectionRecord> {
    const images: InspectionImage[] = await Promise.all(input.images.map(async (image, index) => ({ id: `${inspectionId}-image-${index + 1}`, name: image.file.name, previewUrl: await fileToDataUrl(image.file), role: image.role, size: image.file.size })))
    const record: InspectionRecord = { inspectionId, productName: input.productName.trim(), category: input.category, brand: input.brand.trim(), sku: input.sku.trim(), notes: input.notes.trim(), images, createdAt: new Date().toISOString(), processingStatus: 'created', findings: [], evidence: [] }
    return this.save(record)
  },
  setProcessingStatus(inspectionId: string, status: InspectionProcessingStatus, errorMessage?: string) { return this.update(inspectionId, { processingStatus: status, errorMessage }) },
}
