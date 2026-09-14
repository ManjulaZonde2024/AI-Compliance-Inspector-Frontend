import type { InspectionEvidence, InspectionResult } from '../types/inspection'

const productImage = 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=85'
const labelImage = 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=85'

export const inspectionResultMock: InspectionResult = {
  inspectionId: 'INSP-2026-4821',
  productName: 'Hydrating Daily Face Cream',
  category: 'Cosmetics',
  inspectedAt: '2026-09-08T09:42:00Z',
  status: 'non-compliant',
  score: 68,
  summary: 'The submitted product contains declarations that need corrective attention before it can be cleared.',
  findings: [
    { id: 'finding-declaration', title: 'Mandatory declaration is not visible', severity: 'high', explanation: 'The supplied product views do not show a complete mandatory declaration in the expected label area.', detectedValue: 'Declaration not found in submitted label view', expectedValue: 'A complete declaration should be visible on the product label', evidenceId: 'evidence-declaration' },
    { id: 'finding-text', title: 'Declaration text may be unreadable', severity: 'medium', explanation: 'The declaration text is present in the supplied image, but its legibility is reduced at the captured size.', detectedValue: 'Text appears blurred at the label edge', expectedValue: 'Declaration text should be legible in the submitted product view', reference: 'Inspection evidence note', evidenceId: 'evidence-text' },
    { id: 'finding-placement', title: 'Information placement issue detected', severity: 'low', explanation: 'The visible information appears close to the package edge and may require a clearer product view for confirmation.', detectedValue: 'Information positioned near lower package edge', expectedValue: 'Information should be clearly presented within the label area', evidenceId: 'evidence-placement' },
  ],
}

export const inspectionEvidenceMock: InspectionEvidence[] = [
  { id: 'evidence-declaration', findingId: 'finding-declaration', imageUrl: productImage, cropUrl: labelImage, imageAlt: 'White cosmetic jar photographed on a neutral surface', title: 'Mandatory declaration is not visible', detectedValue: 'Declaration not found in submitted label view', expectedValue: 'A complete declaration should be visible on the product label', explanation: 'The returned evidence points to the submitted label view where the required declaration is not visible.', boundingBox: { x: 28, y: 42, width: 44, height: 28 } },
  { id: 'evidence-text', findingId: 'finding-text', imageUrl: labelImage, imageAlt: 'Close-up of cosmetic product label text', title: 'Declaration text may be unreadable', detectedValue: 'Text appears blurred at the label edge', expectedValue: 'Declaration text should be legible in the submitted product view', reference: 'Inspection evidence note', explanation: 'The supplied close-up shows the returned region associated with the legibility finding.', boundingBox: { x: 14, y: 50, width: 72, height: 24 } },
  { id: 'evidence-placement', findingId: 'finding-placement', imageUrl: productImage, imageAlt: 'Cosmetic jar showing the lower package edge', title: 'Information placement issue detected', detectedValue: 'Information positioned near lower package edge', expectedValue: 'Information should be clearly presented within the label area', explanation: 'This evidence item shows the returned area associated with the placement finding.', boundingBox: { x: 22, y: 64, width: 56, height: 22 } },
]
