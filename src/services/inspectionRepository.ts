import { inspectionEvidenceMock, inspectionResultMock } from '../mocks/result'
import { inspectionHistoryMock } from '../mocks/history'
import type { CreateInspectionInput, InspectionRecord, InspectionImage, InspectionProcessingStatus, ProductCategory } from '../types'

const storageKey = 'ai-compliance-inspector.inspections.v1'

function seedRecords(): InspectionRecord[] {
  const findingRecord = (inspectionId: string, productName: string, category: ProductCategory | '', inspectedAt: string, status: InspectionRecord['complianceStatus'], findingCount: number, severity: InspectionRecord['findings'][number]['severity'] | undefined): InspectionRecord => ({
    inspectionId, productName, category, brand: '', sku: '', notes: '', images: [], createdAt: inspectedAt, inspectedAt, processingStatus: 'completed', complianceStatus: status, complianceScore: inspectionId === inspectionResultMock.inspectionId ? inspectionResultMock.score : undefined, summary: inspectionId === inspectionResultMock.inspectionId ? inspectionResultMock.summary : findingCount ? 'Returned findings were detected during automated evaluation.' : 'No material findings were returned for this inspection.', findings: inspectionId === inspectionResultMock.inspectionId ? inspectionResultMock.findings : severity ? Array.from({ length: findingCount }, (_, index) => ({ id: `${inspectionId}-finding-${index + 1}`, title: `Finding ${index + 1} detected`, severity, explanation: 'A finding was returned by automated evaluation.' })) : [], evidence: inspectionId === inspectionResultMock.inspectionId ? inspectionEvidenceMock : [], reportStatus: 'Generated', reportVersion: 'Draft 1.0'
  })
  return inspectionHistoryMock.inspections.map((item) => findingRecord(item.inspectionId, item.productName, (item.category ?? '') as ProductCategory | '', item.inspectedAt, item.status, item.findingCount, item.highestSeverity)).map((record) => record.inspectionId === inspectionResultMock.inspectionId ? { ...record, productName: inspectionResultMock.productName, category: inspectionResultMock.category as ProductCategory, findings: inspectionResultMock.findings, evidence: inspectionEvidenceMock, complianceScore: inspectionResultMock.score, summary: inspectionResultMock.summary } : record)
}

function readRecords(): InspectionRecord[] {
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
  try { localStorage.setItem(storageKey, JSON.stringify(records)) } catch { /* Development persistence is best effort. */ }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(file) })
}

export const inspectionRepository = {
  list(): InspectionRecord[] { return readRecords() },
  get(inspectionId: string): InspectionRecord | undefined { return readRecords().find((record) => record.inspectionId === inspectionId) },
  save(record: InspectionRecord): InspectionRecord { const records = readRecords().filter((item) => item.inspectionId !== record.inspectionId); writeRecords([record, ...records]); return record },
  update(inspectionId: string, patch: Partial<InspectionRecord>): InspectionRecord | undefined { const record = this.get(inspectionId); if (!record) return undefined; return this.save({ ...record, ...patch }) },
  async create(input: CreateInspectionInput, inspectionId: string): Promise<InspectionRecord> {
    const images: InspectionImage[] = await Promise.all(input.images.map(async (image, index) => ({ id: `${inspectionId}-image-${index + 1}`, name: image.file.name, previewUrl: await fileToDataUrl(image.file), role: image.role, size: image.file.size })))
    const record: InspectionRecord = { inspectionId, productName: input.productName.trim(), category: input.category, brand: input.brand.trim(), sku: input.sku.trim(), notes: input.notes.trim(), images, createdAt: new Date().toISOString(), processingStatus: 'created', findings: [], evidence: [] }
    return this.save(record)
  },
  setProcessingStatus(inspectionId: string, status: InspectionProcessingStatus, errorMessage?: string) { return this.update(inspectionId, { processingStatus: status, errorMessage }) },
}
