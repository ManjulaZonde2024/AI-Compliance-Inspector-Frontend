import type { DashboardData } from '../types/dashboard'

export const dashboardMockData: DashboardData = {
  overview: { totalInspections: 8, compliant: 2, nonCompliant: 6 },
  openFindingsBySeverity: { high: 5, medium: 5, low: 2 },
  activity: [
    { date: 'Sep 02', inspections: 0 },
    { date: 'Sep 03', inspections: 1 },
    { date: 'Sep 04', inspections: 0 },
    { date: 'Sep 05', inspections: 1 },
    { date: 'Sep 06', inspections: 1 },
    { date: 'Sep 07', inspections: 2 },
    { date: 'Sep 08', inspections: 2 },
  ],
  recentInspections: [
    { id: 'INSP-2026-4821', product: 'Hydrating Daily Face Cream', productCategory: 'Cosmetics', inspectedAt: '2026-09-08T09:42:00Z', status: 'non-compliant', findingCount: 3, highestSeverity: 'high', findingSummary: 'Mandatory declaration requires corrective attention' },
    { id: 'INSP-2026-0918', product: 'Calm Restore Night Cream', productCategory: 'Cosmetics', inspectedAt: '2026-09-08T09:02:00Z', status: 'non-compliant', findingCount: 2, highestSeverity: 'medium', findingSummary: 'Returned findings were detected during automated evaluation' },
    { id: 'INSP-2026-0917', product: 'PureFuel Protein Blend', productCategory: 'Nutrition', inspectedAt: '2026-09-07T16:18:00Z', status: 'compliant', findingCount: 0, highestSeverity: 'none', findingSummary: 'No material findings identified' },
    { id: 'INSP-2026-0916', product: 'ClearAir Home Sanitizer', productCategory: 'Consumer goods', inspectedAt: '2026-09-07T13:04:00Z', status: 'non-compliant', findingCount: 3, highestSeverity: 'high', findingSummary: 'Unapproved efficacy claim on front label' },
    { id: 'INSP-2026-0915', product: 'Daily Defense SPF 50', productCategory: 'Cosmetics', inspectedAt: '2026-09-06T11:46:00Z', status: 'non-compliant', findingCount: 1, highestSeverity: 'low', findingSummary: 'Usage direction legibility issue detected' },
    { id: 'INSP-2026-0914', product: 'Harvest Oat Beverage', productCategory: 'Food & beverage', inspectedAt: '2026-09-05T08:21:00Z', status: 'compliant', findingCount: 0, highestSeverity: 'none', findingSummary: 'No material findings identified' },
    { id: 'INSP-2026-0909', product: 'FreshStart Herbal Shampoo', productCategory: 'Personal care', inspectedAt: '2026-09-03T15:12:00Z', status: 'non-compliant', findingCount: 2, highestSeverity: 'medium', findingSummary: 'Returned findings were detected during automated evaluation' },
    { id: 'INSP-2026-0904', product: 'Golden Grain Flour', productCategory: 'Food & beverage', inspectedAt: '2026-09-01T10:30:00Z', status: 'non-compliant', findingCount: 1, highestSeverity: 'high', findingSummary: 'Returned findings were detected during automated evaluation' },
  ],
}
