import { inspectionRepository } from './inspectionRepository'
import type { DashboardData } from '../types/dashboard'

/** Dashboard data boundary; replace with an API client once its contract exists. */
export const dashboardService = {
  async getDashboard(): Promise<DashboardData> {
    const records = await inspectionRepository.list()
    const completed = records.filter((record) => record.processingStatus === 'completed' && record.complianceStatus)
    const compliant = completed.filter((record) => record.complianceStatus === 'compliant').length
    const nonCompliant = completed.filter((record) => record.complianceStatus === 'non-compliant').length
    const recentInspections = completed.sort((a, b) => new Date(b.inspectedAt ?? b.createdAt).getTime() - new Date(a.inspectedAt ?? a.createdAt).getTime()).slice(0, 8).map((record) => ({ id: record.inspectionId, product: record.productName, productCategory: record.category || 'Category not returned', inspectedAt: record.inspectedAt ?? record.createdAt, status: record.complianceStatus!, findingCount: record.findings.length, highestSeverity: record.findings.reduce((highest, finding) => ({ high: 3, medium: 2, low: 1 }[finding.severity] > ({ high: 3, medium: 2, low: 1 }[highest as Exclude<typeof highest, 'none'>] ?? 0) ? finding.severity : highest), 'none' as 'none' | 'low' | 'medium' | 'high'), findingSummary: record.findings[0]?.title ?? 'No material findings returned' }))
    const activityMap = new Map<string, number>()
    const activityDates = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (6 - index)); return date })
    activityDates.forEach((date) => activityMap.set(new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit' }).format(date), 0))
    completed.forEach((record) => { const date = new Date(record.inspectedAt ?? record.createdAt); const label = new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit' }).format(date); if (activityMap.has(label)) activityMap.set(label, (activityMap.get(label) ?? 0) + 1) })
    const activity = Array.from(activityMap.entries()).map(([date, inspections]) => ({ date, inspections }))
    const findings = completed.flatMap((record) => record.findings)
    return Promise.resolve({ overview: { totalInspections: completed.length, compliant, nonCompliant }, openFindingsBySeverity: { high: findings.filter((finding) => finding.severity === 'high').length, medium: findings.filter((finding) => finding.severity === 'medium').length, low: findings.filter((finding) => finding.severity === 'low').length }, recentInspections, activity })
  },
}
