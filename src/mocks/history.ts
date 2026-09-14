import type { InspectionHistory } from '../types/history'

export const inspectionHistoryMock: InspectionHistory = {
  inspections: [
    { inspectionId: 'INSP-2026-4821', productName: 'Hydrating Daily Face Cream', category: 'Cosmetics', inspectedAt: '2026-09-08T09:42:00Z', status: 'non-compliant', findingCount: 3, highestSeverity: 'high' },
    { inspectionId: 'INSP-2026-0918', productName: 'Calm Restore Night Cream', category: 'Cosmetics', inspectedAt: '2026-09-08T09:02:00Z', status: 'non-compliant', findingCount: 2, highestSeverity: 'medium' },
    { inspectionId: 'INSP-2026-0917', productName: 'PureFuel Protein Blend', category: 'Nutrition', inspectedAt: '2026-09-07T16:18:00Z', status: 'compliant', findingCount: 0 },
    { inspectionId: 'INSP-2026-0916', productName: 'ClearAir Home Sanitizer', category: 'Consumer goods', inspectedAt: '2026-09-07T13:04:00Z', status: 'non-compliant', findingCount: 3, highestSeverity: 'high' },
    { inspectionId: 'INSP-2026-0915', productName: 'Daily Defense SPF 50', category: 'Cosmetics', inspectedAt: '2026-09-06T11:46:00Z', status: 'non-compliant', findingCount: 1, highestSeverity: 'low' },
    { inspectionId: 'INSP-2026-0914', productName: 'Harvest Oat Beverage', category: 'Food & beverage', inspectedAt: '2026-09-05T08:21:00Z', status: 'compliant', findingCount: 0 },
    { inspectionId: 'INSP-2026-0909', productName: 'FreshStart Herbal Shampoo', category: 'Personal care', inspectedAt: '2026-09-03T15:12:00Z', status: 'non-compliant', findingCount: 2, highestSeverity: 'medium' },
    { inspectionId: 'INSP-2026-0904', productName: 'Golden Grain Flour', category: 'Food & beverage', inspectedAt: '2026-09-01T10:30:00Z', status: 'non-compliant', findingCount: 1, highestSeverity: 'high' },
  ],
}
