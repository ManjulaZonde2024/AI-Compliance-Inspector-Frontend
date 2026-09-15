export const productCategories = [
  'Cosmetics',
  'Food & beverage',
  'Nutrition',
  'Consumer goods',
  'Personal care',
  'Household products',
  'Other',
] as const

export type ProductCategory = (typeof productCategories)[number]
export type InspectionImageRole = 'front' | 'back' | 'side' | 'label'

export type InspectionImageInput = {
  file: File
  previewUrl: string
  role: InspectionImageRole
}

export type InspectionImage = {
  id: string
  name: string
  previewUrl: string
  role: InspectionImageRole
  size: number
}

export type CreateInspectionInput = {
  productName: string
  category: ProductCategory | ''
  brand: string
  sku: string
  notes: string
  images: InspectionImageInput[]
}

export type CreateInspectionResult = {
  inspectionId: string
}

export type StoredInspectionContext = {
  inspectionId: string
  productName: string
  category: ProductCategory | ''
  inspectedAt: string
}

export type InspectionProcessingStatus = 'created' | 'submitted' | 'processing' | 'completed' | 'failed'

export type InspectionRecord = {
  inspectionId: string
  productName: string
  category: ProductCategory | ''
  brand: string
  sku: string
  notes: string
  images: InspectionImage[]
  createdAt: string
  processingStatus: InspectionProcessingStatus
  complianceStatus?: ComplianceStatus
  complianceScore?: number
  summary?: string
  findings: InspectionFinding[]
  evidence: InspectionEvidence[]
  reportStatus?: string
  reportVersion?: string
  inspectedAt?: string
  errorMessage?: string
}

export type ComplianceStatus = 'compliant' | 'non-compliant'
export type FindingSeverity = 'high' | 'medium' | 'low'

export type EvidenceBoundingBox = {
  x: number
  y: number
  width: number
  height: number
}

export type InspectionFinding = {
  id: string
  title: string
  severity: FindingSeverity
  explanation: string
  detectedValue?: string
  expectedValue?: string
  reference?: string
  evidenceId?: string
}

export type InspectionResult = {
  inspectionId: string
  productName: string
  category?: string
  inspectedAt?: string
  status: ComplianceStatus
  score?: number
  summary: string
  findings: InspectionFinding[]
}

export type InspectionEvidence = {
  id: string
  findingId: string
  imageUrl: string
  cropUrl?: string
  imageAlt: string
  title: string
  detectedValue?: string
  expectedValue?: string
  reference?: string
  explanation: string
  boundingBox?: EvidenceBoundingBox
}

/**
 * Canonical per-inspection result payload returned by the result boundary.
 * One inspection has exactly one `InspectionResultData`: the compliance
 * decision, its findings, and the supporting evidence that belongs to that
 * result. Result, Evidence, and Report surfaces consume this same payload so
 * a single inspection ID always renders one coherent result. A future API
 * adapter can return this shape unchanged.
 */
export type InspectionResultData = InspectionResult & {
  evidence: InspectionEvidence[]
}

export type InspectionReport = {
  result: InspectionResult
  evidence: InspectionEvidence[]
  generatedAt?: string
  reportStatus?: string
  reportVersion?: string
}
