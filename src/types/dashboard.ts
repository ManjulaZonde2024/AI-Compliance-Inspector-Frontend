export type InspectionStatus = 'compliant' | 'non-compliant'
export type InspectionSeverity = 'none' | 'low' | 'medium' | 'high'

export type DashboardInspection = {
  id: string
  product: string
  productCategory: string
  inspectedAt: string
  status: InspectionStatus
  findingCount: number
  highestSeverity: InspectionSeverity
  findingSummary: string
}

export type ComplianceOverview = {
  totalInspections: number
  compliant: number
  nonCompliant: number
}

export type DashboardData = {
  overview: ComplianceOverview
  openFindingsBySeverity: { high: number; medium: number; low: number }
  recentInspections: DashboardInspection[]
  activity: { date: string; inspections: number }[]
}
