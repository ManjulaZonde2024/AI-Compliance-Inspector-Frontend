import type { ScanInspectionContext, ScanStage } from '../types/scan'

export const scanStageFixtures: Omit<ScanStage, 'state'>[] = [
  { key: 'image-check', label: 'Image check', description: 'Confirming the submitted image set is ready for review.' },
  { key: 'image-processing', label: 'Image processing', description: 'Preparing the supplied product views for analysis.' },
  { key: 'declaration-analysis', label: 'Declaration analysis', description: 'Reviewing visible packaged-product declarations.' },
  { key: 'information-extraction', label: 'Information extraction', description: 'Organizing relevant information from the supplied images.' },
  { key: 'compliance-evaluation', label: 'Compliance evaluation', description: 'Preparing the inspection outcome for review.' },
  { key: 'evidence-preparation', label: 'Evidence preparation', description: 'Assembling supporting inspection references.' },
  { key: 'final-result', label: 'Final result', description: 'Finalizing the inspection workspace.' },
]

export const fallbackScanContext: ScanInspectionContext = {
  productName: 'Submitted product',
  category: '',
  images: [],
}
