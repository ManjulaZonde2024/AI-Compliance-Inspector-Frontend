import { Route, Routes } from 'react-router-dom'
import { ErrorBoundary } from './components/error/ErrorBoundary'
import { AppShell } from './components/layout/AppShell'
import { DashboardPage } from './pages/DashboardPage'
import { HistoryPage } from './pages/HistoryPage'
import { InspectionEvidencePage } from './pages/InspectionEvidencePage'
import { InspectionReportPage } from './pages/InspectionReportPage'
import { InspectionResultPage } from './pages/InspectionResultPage'
import { InspectionScanPage } from './pages/InspectionScanPage'
import { NewInspectionPage } from './pages/NewInspectionPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SettingsPage } from './pages/SettingsPage'
import { WelcomePage } from './pages/WelcomePage'

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inspections/new" element={<NewInspectionPage />} />
          <Route path="/inspections/:id/scan" element={<InspectionScanPage />} />
          <Route
            path="/inspections/:id/result"
            element={<InspectionResultPage />}
          />
          <Route
            path="/inspections/:id/evidence"
            element={<InspectionEvidencePage />}
          />
          <Route
            path="/inspections/:id/report"
            element={<InspectionReportPage />}
          />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}
