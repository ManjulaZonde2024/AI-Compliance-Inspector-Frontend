import { inspectionEvidenceMock, inspectionResultMock } from '../mocks/result'
import { inspectionHistoryMock } from '../mocks/history'
import type { CreateInspectionInput, InspectionRecord, InspectionImage, InspectionProcessingStatus, InspectionResultData, ProductCategory } from '../types'

/**
 * Development persistence boundary. Inspection records (including compressed
 * inline image data URLs) are stored in IndexedDB, which has no ~5 MB
 * localStorage-style quota, so repeated demo inspections cannot exhaust
 * storage. The public API is asynchronous: every operation resolves only
 * after IndexedDB confirms the read/write. Records are persisted and returned
 * exactly as stored — no field normalization is applied.
 */
const dbName = 'ai-compliance-inspector'
const dbVersion = 1
const storeName = 'inspections'

// Obsolete localStorage inspection stores from before IndexedDB became
// canonical. They are migrated once, then removed. Unrelated keys (settings,
// etc.) are never touched and localStorage.clear() is never used.
const legacyStorageKeys = [
  'ai-compliance-inspector.inspections.v2',
  'ai-compliance-inspector.inspections.v1',
]

let dbPromise: Promise<IDBDatabase> | null = null
let initPromise: Promise<void> | null = null

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName, { keyPath: 'inspectionId' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
  return dbPromise
}

/**
 * One-time initialization: migrate any existing localStorage inspection data
 * into IndexedDB, or seed development records when there is nothing to
 * migrate. Migration is idempotent — it only runs while the store is empty,
 * and legacy keys are removed only after their records are safely written.
 */
async function initStore(): Promise<void> {
  const db = await openDb()
  const store = db.transaction(storeName, 'readwrite').objectStore(storeName)
  const existingCount = await requestToPromise(store.count())
  if (existingCount > 0) return

  const migrated: InspectionRecord[] = []
  for (const legacyKey of legacyStorageKeys) {
    try {
      const raw = localStorage.getItem(legacyKey)
      if (!raw) continue
      const parsed = JSON.parse(raw) as InspectionRecord[]
      if (Array.isArray(parsed)) {
        for (const record of parsed) {
          if (record && typeof record.inspectionId === 'string' && !migrated.some((existing) => existing.inspectionId === record.inspectionId)) migrated.push(record)
        }
      }
    } catch {
      // Unparsable legacy data is left untouched rather than destroyed.
    }
  }

  const records = migrated.length ? migrated : seedRecords()
  for (const record of records) await requestToPromise(store.put(record))

  // Only after every record is safely persisted may the obsolete keys go.
  for (const legacyKey of legacyStorageKeys) {
    try { localStorage.removeItem(legacyKey) } catch { /* best effort; never blocks initialization. */ }
  }
}

function dbReady(): Promise<IDBDatabase> {
  initPromise ??= initStore().catch((error) => {
    initPromise = null
    throw error
  })
  return initPromise.then(() => openDb())
}

async function idbGetAll(): Promise<InspectionRecord[]> {
  const db = await dbReady()
  return requestToPromise(db.transaction(storeName).objectStore(storeName).getAll() as IDBRequest<InspectionRecord[]>)
}

async function idbGet(inspectionId: string): Promise<InspectionRecord | undefined> {
  const db = await dbReady()
  return requestToPromise(db.transaction(storeName).objectStore(storeName).get(inspectionId) as IDBRequest<InspectionRecord | undefined>)
}

async function idbPut(record: InspectionRecord): Promise<void> {
  const db = await dbReady()
  await requestToPromise(db.transaction(storeName, 'readwrite').objectStore(storeName).put(record))
}

function seedRecords(): InspectionRecord[] {
  const findingRecord = (inspectionId: string, productName: string, category: ProductCategory | '', inspectedAt: string, status: InspectionRecord['complianceStatus'], findingCount: number, severity: InspectionRecord['findings'][number]['severity'] | undefined): InspectionRecord => ({
    inspectionId, productName, category, brand: '', sku: '', notes: '', images: [], createdAt: inspectedAt, inspectedAt, processingStatus: 'completed', complianceStatus: status, complianceScore: inspectionId === inspectionResultMock.inspectionId ? inspectionResultMock.score : undefined, summary: inspectionId === inspectionResultMock.inspectionId ? inspectionResultMock.summary : findingCount ? 'Returned findings were detected during automated evaluation.' : 'No material findings were returned for this inspection.', findings: inspectionId === inspectionResultMock.inspectionId ? inspectionResultMock.findings : severity ? Array.from({ length: findingCount }, (_, index) => ({ id: `${inspectionId}-finding-${index + 1}`, title: `Finding ${index + 1} detected`, severity, explanation: 'A finding was returned by automated evaluation.' })) : [], evidence: inspectionId === inspectionResultMock.inspectionId ? inspectionEvidenceMock : [], reportStatus: 'Generated', reportVersion: 'Draft 1.0'
  })
  return inspectionHistoryMock.inspections.map((item) => findingRecord(item.inspectionId, item.productName, (item.category ?? '') as ProductCategory | '', item.inspectedAt, item.status, item.findingCount, item.highestSeverity)).map((record) => record.inspectionId === inspectionResultMock.inspectionId ? { ...record, productName: inspectionResultMock.productName, category: inspectionResultMock.category as ProductCategory, findings: inspectionResultMock.findings, evidence: inspectionEvidenceMock, complianceScore: inspectionResultMock.score, summary: inspectionResultMock.summary } : record)
}

/*
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

*/
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
  async list(): Promise<InspectionRecord[]> { return idbGetAll() },
  async get(inspectionId: string): Promise<InspectionRecord | undefined> { return idbGet(inspectionId) },
  async getResultData(inspectionId: string): Promise<InspectionResultData | undefined> {
    const record = await this.get(inspectionId)
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
  async save(record: InspectionRecord): Promise<InspectionRecord> { await idbPut(record); return record },
  async update(inspectionId: string, patch: Partial<InspectionRecord>): Promise<InspectionRecord | undefined> { const record = await this.get(inspectionId); if (!record) return undefined; return this.save({ ...record, ...patch }) },
  async create(input: CreateInspectionInput, inspectionId: string): Promise<InspectionRecord> {
    const images: InspectionImage[] = await Promise.all(input.images.map(async (image, index) => ({ id: `${inspectionId}-image-${index + 1}`, name: image.file.name, previewUrl: await fileToDataUrl(image.file), role: image.role, size: image.file.size })))
    const record: InspectionRecord = { inspectionId, productName: input.productName.trim(), category: input.category, brand: input.brand.trim(), sku: input.sku.trim(), notes: input.notes.trim(), images, createdAt: new Date().toISOString(), processingStatus: 'created', findings: [], evidence: [] }
    return this.save(record)
  },
  setProcessingStatus(inspectionId: string, status: InspectionProcessingStatus, errorMessage?: string) { return this.update(inspectionId, { processingStatus: status, errorMessage }) },
}
