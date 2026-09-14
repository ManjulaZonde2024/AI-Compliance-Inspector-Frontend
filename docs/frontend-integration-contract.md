# Frontend Integration Contract

This document records the current frontend service boundaries and the local development adapter contract. UI components call services; services currently read from the local inspection repository and can later be switched to API adapters without changing page components.

## Boundary

```text
Page/component -> service -> local repository (current) / API adapter (integration)
```

The local repository at `src/services/inspectionRepository.ts` is the canonical source of truth for development and demo data. Seeded records are loaded once into local storage; newly created inspections are persisted there and flow through scan, result, evidence, report, dashboard, and history services.

## Services

| Service/function | Purpose | Input | Output | Important IDs | Integration dependency |
| --- | --- | --- | --- | --- | --- |
| `inspectionService.createInspection` | Create an inspection intake record | `CreateInspectionInput` | `CreateInspectionResult` with `inspectionId` | `inspectionId` | Backend creation response should return the stable inspection ID and, ideally, persisted product/context metadata. |
| `scanService.getInitialScan` | Start image validation and processing state | `inspectionId`, optional `ScanInspectionContext` | `ScanSnapshot` | `inspectionId`, stage `key` | Replace presentation-only stage advancement with status polling or streaming when the processing API exists. |
| `scanService.advanceScan` | Development-only stage progression | `ScanSnapshot` | Updated `ScanSnapshot` | `inspectionId`, `attempt` | Not an API contract; remove or adapt when the backend owns stage transitions. |
| `scanService.retryScan` | Retry a failed development scan | `ScanSnapshot` | `ScanSnapshot` | `inspectionId`, `attempt` | Backend retry policy and idempotency are pending. |
| `resultService.getResult` | Load the compliance decision | `inspectionId` | `InspectionResult` | `inspectionId`, finding IDs | API must return status, optional score, summary, and findings with stable IDs. |
| `evidenceService.getEvidence` | Load supporting evidence | `inspectionId` | `InspectionEvidence[]` | `inspectionId`, `findingId`, evidence ID | API must relate each evidence item to a finding and provide image/region data where available. |
| `reportService.getReport` | Load the formal inspection report | `inspectionId` | `InspectionReport` | `inspectionId`, finding/evidence IDs | Report generation/version/status semantics are pending backend confirmation. |
| `reportService.downloadReportPdf` | Request PDF export | `inspectionId` | `Promise<void>` currently | `inspectionId` | Real adapter must return a downloadable file/blob or signed URL and distinguish export errors. |
| `reportService.exportReportEditable` | Request editable export | `inspectionId` | `Promise<void>` currently | `inspectionId` | Real adapter must define file type and download response. |
| `historyService.getInspectionHistory` | Load inspection registry records | none currently | `InspectionHistory` | `inspectionId` | Server-side filters/pagination may be added without changing the table model. |
| `dashboardService.getDashboard` | Derive operational dashboard data | none currently | `DashboardData` | inspection IDs | Production analytics should be derived from the same inspection records or an agreed aggregate endpoint. |
| `settingsService.getRagSettings` | Load knowledge-base synchronization settings | none | `RagSettings` | none currently | Authentication/permission handling and source ownership are pending. |
| `settingsService.saveRagSettings` | Persist synchronization settings | `RagSettings` | Saved `RagSettings` | none currently | Backend must define validation, authorization, and conflict behavior. |

## Domain relationships

- `InspectionRecord` is the local aggregate: inspection ID, product fields, images, processing status, result fields, findings, evidence, and report metadata.
- `InspectionRecord.images` contains stable image IDs, file metadata, preview data, and image role.
- `InspectionRecord.processingStatus` and `ScanSnapshot.stages` represent scan lifecycle and stage state.
- `InspectionResult` is derived from an inspection record and links findings through finding IDs.
- `InspectionFinding.evidenceId` links a finding to an `InspectionEvidence.id`.
- `InspectionEvidence.findingId` links evidence back to its finding and may include an image URL and bounding box region.
- `InspectionReport.result` and `InspectionReport.evidence` represent the formal record assembled for one inspection.
- `HistoryInspection` is a read model derived from completed inspection records.
- `RagSettings` represents knowledge-base synchronization configuration.

## Error contract

Current local services reject with `Error` messages and pages expose loading, retry, empty, and failure states. The real adapter should normalize failures to a stable shape:

```ts
type FrontendServiceError = {
  message: string
  code?: 'validation' | 'network' | 'not-found' | 'processing' | 'permission' | 'unknown'
  retryable: boolean
}
```

The backend contract still needs to define authentication/permission errors, validation payloads, not-found behavior, processing failure details, export failures, and whether scan state is polled or pushed.

## Integration checklist

- Preserve stable `inspectionId`, finding IDs, evidence IDs, and image IDs across requests.
- Keep product/category/images from intake associated with the same inspection ID.
- Replace repository access inside services, not in page components.
- Replace development-only `advanceScan` with the agreed processing-status API.
- Define real PDF/editable export responses before wiring downloads.
- Confirm Legal Metrology source and knowledge-base synchronization permissions before enabling role-specific controls.
