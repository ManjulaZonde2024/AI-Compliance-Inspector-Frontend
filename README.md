# AI Compliance Inspector — Frontend

An enterprise-focused frontend for an **AI Compliance Inspector** designed to assess packaged commodities against the **Legal Metrology (Packaged Commodities) Rules, 2011**.

The system provides a structured digital workflow for inspecting products and labels, presenting automated compliance results, displaying evidence, generating reports, and maintaining inspection history.

> **Project Context:** Smart India Hackathon (SIH) — Problem Statement 26034  
> **Repository Scope:** Frontend application

---

## 🎯 Objective

The AI Compliance Inspector aims to help enforcement officials assess packaged commodities through a structured digital inspection workflow.

The frontend supports:

- Product and label inspection
- Image-based inspection workflow
- Automated compliance results
- Detection of compliance findings
- Evidence presentation
- Compliance reporting
- Inspection history and search
- Dashboard-based compliance monitoring

The frontend is designed to present data from backend and AI services through defined service boundaries.

---

## 🖥️ Frontend Scope

This repository contains the **frontend application only**.

### Included

- Landing / Welcome page
- Compliance Dashboard
- New Inspection workflow
- Scan Progress interface
- Compliance Result interface
- Evidence Viewer
- Compliance Report interface
- Inspection History
- Settings
- Reusable UI components
- Typed domain models
- Mock data
- Service layer
- Local development repository

### Backend / AI responsibilities

The following are outside the scope of this repository:

- OCR processing
- Computer vision / image analysis
- AI model inference
- Legal rule-engine implementation
- RAG processing
- Backend database
- Authentication internals
- Evidence generation
- Report-generation backend
- Scheduled backend processing

The frontend communicates with these capabilities through service boundaries so that the current mock implementation can later be replaced by real APIs.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| **React 19** | UI development |
| **TypeScript 6** | Type-safe application development |
| **Vite 8** | Development server and production builds |
| **React Router 7** | Application routing |
| **Tailwind CSS 4** | Styling and design system |
| **Oxlint** | Linting |
| **localStorage** | Current local development repository |
| **IBM Plex Sans** | Application typography |

### Tooling

- `@vitejs/plugin-react`
- `@tailwindcss/vite`
- TypeScript project references
- Vite path alias: `@` → `src`

No additional state-management, charting, HTTP-client, ORM, or testing framework is currently required.

---

## 🏗️ Architecture

The frontend follows a **mock-first, service-boundary architecture**.

```text
                    ┌─────────────────────┐
                    │     React Pages     │
                    │  & UI Components    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Service Layer    │
                    │    Async Boundary   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Local Repository    │
                    │    + Mock Data      │
                    └──────────┬──────────┘
                               │
                         Future API
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Backend / AI System │
                    └─────────────────────┘