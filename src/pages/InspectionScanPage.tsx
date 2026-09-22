import { useLocation, useParams } from 'react-router-dom'
import { InspectionScanSession } from '../components/inspection/InspectionScanSession'
import type { ScanInspectionContext } from '../types'

/**
 * Standalone scan route. The same session component also renders inline
 * inside NewInspectionPage, so the scan experience can appear either here
 * or on the New Inspection page without duplicating any scan logic.
 */
export function InspectionScanPage() {
  const { id } = useParams()
  const location = useLocation()

  if (!id) return null

  return (
    <InspectionScanSession
      inspectionId={id}
      context={location.state as ScanInspectionContext | null}
    />
  )
}
