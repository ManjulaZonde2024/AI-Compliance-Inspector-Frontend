import type { InspectionImageRole, ProductCategory } from './inspection'

export type ScanStageKey = 'image-check' | 'image-processing' | 'declaration-analysis' | 'information-extraction' | 'compliance-evaluation' | 'evidence-preparation' | 'final-result'
export type ScanStageState = 'pending' | 'active' | 'completed' | 'failed'
export type ScanStatus = 'processing' | 'completed' | 'failed'

export type ScanImagePreview = { previewUrl: string; role: InspectionImageRole }
export type ScanInspectionContext = {
  productName: string
  category: ProductCategory | ''
  images: ScanImagePreview[]
}

export type ScanStage = {
  key: ScanStageKey
  label: string
  description: string
  state: ScanStageState
}

export type ScanSnapshot = {
  inspectionId: string
  status: ScanStatus
  stages: ScanStage[]
  context: ScanInspectionContext
  attempt: number
  errorMessage?: string
}
