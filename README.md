# AI Compliance Inspector — Frontend

An enterprise-focused frontend for an **AI Compliance Inspector** designed to assess packaged commodities against the **Legal Metrology (Packaged Commodities) Rules, 2011**.

The application provides a structured digital workflow for inspecting products and labels, presenting compliance results, displaying evidence, generating reports, and maintaining inspection history.

> **Project Context:** Smart India Hackathon (SIH) — Problem Statement 26034  
> **Repository Scope:** Frontend Application

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js 24+
- npm 11+
- Git

Check your versions:

```bash
node --version
npm --version
git --version
```

### Clone the Repository

```bash
git clone https://github.com/ManjulaZonde2024/AI-Compliance-Inspector-Frontend.git
cd AI-Compliance-Inspector-Frontend
```

### Install Dependencies

```bash
npm install
```

### Run the Development Server

```bash
npm run dev
```

Vite will provide a local development URL, typically:

```text
http://localhost:5173
```

Open the displayed URL in your browser.

### Validate the Project

Run the following before committing frontend changes:

```bash
npm run lint
npm run build
```

Both commands should complete successfully.

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
- Compliance dashboards
- RAG/settings interface
- Responsive enterprise-oriented UI

The frontend acts as the presentation and interaction layer of the larger AI Compliance Inspector system.

---

## 🖥️ Frontend Scope

The frontend covers the following major interfaces:

- Landing / Welcome Page
- Compliance Dashboard
- New Inspection
- Product Image Management
- Scan Progress
- Compliance Result
- Evidence Viewer
- Compliance Report
- Inspection History & Search
- Settings / RAG Configuration UI

### Backend / AI Responsibilities

The following responsibilities belong to the backend and AI processing layers:

- OCR processing
- Image / computer vision analysis
- Declaration extraction
- Compliance rule evaluation
- RAG processing
- Evidence generation and validation
- Report generation
- Database operations
- Authentication internals
- Scheduling and background processing

The frontend consumes and presents the resulting data through defined service boundaries.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React 19 | UI development |
| TypeScript 6 | Type-safe application development |
| Vite 8 | Development server and build tooling |
| React Router 7 | Client-side routing |
| Tailwind CSS 4 | Styling and responsive UI |
| IBM Plex Sans | Interface typography |
| Local Storage | Current local development repository |
| Oxlint | Code linting |

### Development Tools

- Git
- GitHub
- VS Code
- npm
- Node.js

---

## 🏗️ Architecture

The frontend follows a service-oriented, mock-first architecture:

```text
React Pages / Components
          ↓
      Service Layer
          ↓
 Local Repository / Mock Data
          ↓
      Future API
          ↓
 Backend / AI Services
```

The architecture keeps UI components independent from backend implementation details.

### Service Boundary

```text
Page / Component
       ↓
    Service
       ↓
Local Repository
       ↓
Future API Adapter
       ↓
Backend / AI System
```

Backend/API communication should remain inside the service layer rather than being implemented directly inside pages or presentational components.

---

## 🧭 Application Routes

| Route | Purpose |
|---|---|
| `/` | Landing / Welcome page |
| `/dashboard` | Compliance dashboard |
| `/inspections/new` | Create a new inspection |
| `/inspections/:id/scan` | Scan progress |
| `/inspections/:id/result` | Compliance result |
| `/inspections/:id/evidence` | Evidence viewer |
| `/inspections/:id/report` | Compliance report |
| `/history` | Inspection history and search |
| `/settings` | Application settings |

---

## 🔄 Inspection Workflow

The primary inspection workflow is:

```text
Landing Page
     ↓
Dashboard
     ↓
New Inspection
     ↓
Upload Product Images
     ↓
Scan Progress
     ↓
Compliance Result
     ↓
Evidence
     ↓
Compliance Report
```

The frontend is responsible for the user interface and navigation between these stages.

The actual inspection analysis and compliance processing are handled through the service and backend/AI layers.

---

## 📊 Dashboard

The Compliance Dashboard provides an enforcement-oriented overview of inspection activity.

It includes:

- Total inspections
- Compliant inspections
- Non-compliant inspections
- Compliance rate
- Compliance overview
- Detected violations
- Recent non-compliant inspections
- Inspection activity
- Recent inspections

Dashboard data is structured so that inspection totals, compliance counts, rates, findings, and inspection records remain coherent.

---

## 🖼️ New Inspection

The New Inspection workflow provides:

- Product information entry
- Product category selection
- Product image upload
- Image management
- Inspection readiness state
- Start inspection action

The frontend prepares and presents inspection information for processing through the service layer.

---

## 💾 Data & Mock Repository

The current frontend uses a **mock-first development architecture**.

The local repository is:

```text
src/services/inspectionRepository.ts
```

It acts as the canonical local development data source for inspection-related workflows.

Mock data is maintained under:

```text
src/mocks/
```

The service layer provides the abstraction required to replace local/mock data with backend API integration later.

The current mock implementation does not require environment configuration.

---

## 🔌 Backend Integration

The frontend is designed to integrate with backend services without requiring major changes to page and component responsibilities.

The integration boundary is:

```text
React Pages / Components
          ↓
      Service Layer
          ↓
 Local Repository
          ↓
      API Adapter
          ↓
 Backend / AI Services
```

Important integration requirements include:

- Stable inspection IDs
- Consistent inspection relationships
- Typed service responses
- Backend/API calls isolated inside services
- Consistent compliance result structures
- Consistent finding structures
- Compatible evidence references
- Compatible report references
- Consistent error handling

Detailed integration requirements are documented in:

[Frontend Integration Contract](docs/frontend-integration-contract.md)

---

## 📁 Project Structure

```text
AI-Compliance-Inspector-Frontend/
│
├── .cursor/
│   └── rules/
│       └── frontend.mdc
│
├── docs/
│   └── frontend-integration-contract.md
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── inspection/
│   │   └── ui/
│   │
│   ├── mocks/
│   ├── pages/
│   ├── services/
│   ├── types/
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 🎨 Frontend Development Conventions

When modifying the frontend:

- Use React and TypeScript.
- Keep application data strongly typed.
- Reuse existing components where possible.
- Preserve the existing route structure unless a change is required.
- Keep backend/API access inside the service layer.
- Do not place direct API calls inside presentational components.
- Keep mock data inside the mock layer.
- Keep domain models inside `src/types/`.
- Follow the existing design system and spacing conventions.
- Maintain responsive layouts.
- Keep frontend responsibilities separate from backend/AI processing.
- Avoid unnecessary dependencies.
- Run lint and build checks before committing.

Project-specific frontend conventions are documented in:

[`.cursor/rules/frontend.mdc`](.cursor/rules/frontend.mdc)

---

## 📋 Compliance Status

The primary compliance outcomes presented by the frontend are:

- **Compliant**
- **Non-Compliant**

The frontend should not introduce a separate **"Needs Review"** compliance status unless the product requirements are explicitly changed.

Individual evidence or findings may still contain review-related actions where appropriate.

---

## 🔐 Authentication & Roles

The overall system supports role-based access and authentication.

Authentication and role-management internals are handled through the appropriate application and backend/service layers.

The frontend provides the required interfaces while keeping authentication implementation details separate from inspection-processing logic.

---

## 📱 Responsive Design

The interface is designed to work across:

- Desktop
- Laptop
- Tablet
- Smaller screens

Tables, cards, forms, navigation, and inspection interfaces adapt to available screen space.

---

## 🧪 Development Commands

### Start development server

```bash
npm run dev
```

### Run lint checks

```bash
npm run lint
```

### Create production build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

Before submitting frontend changes:

```bash
npm run lint
npm run build
```

---

## 👥 Team Development Workflow

This repository is the shared frontend codebase for the AI Compliance Inspector project.

### 1. Get the latest code

```bash
git checkout main
git pull origin main
```

### 2. Create a feature branch

```bash
git checkout -b feature/your-feature-name
```

For example:

```bash
git checkout -b feature/dashboard-improvements
```

### 3. Make and test your changes

Implement only the functionality assigned to you and verify the affected workflow.

### 4. Run validation

```bash
npm run lint
npm run build
```

### 5. Commit your changes

```bash
git add .
git commit -m "feat: describe your change"
```

### 6. Push your branch

```bash
git push -u origin feature/your-feature-name
```

### 7. Open a Pull Request

Create a Pull Request on GitHub and merge the changes into `main` after review.

> **Important:** Avoid pushing unfinished work directly to `main`. Always pull the latest changes before starting new work.

---

## 📚 Documentation

### Frontend Integration Contract

[Frontend Integration Contract](docs/frontend-integration-contract.md)

Contains:

- Service responsibilities
- Inputs and outputs
- Data relationships
- Integration requirements
- Error handling
- Backend integration checklist

### Frontend Development Rules

[`.cursor/rules/frontend.mdc`](.cursor/rules/frontend.mdc)

Contains project-specific frontend development conventions.

---

## 📌 Current Status

The frontend currently includes:

- Landing / Welcome experience
- Compliance Dashboard
- New Inspection workflow
- Product image management
- Scan Progress interface
- Compliance Result interface
- Evidence Viewer
- Compliance Report interface
- Inspection History
- Settings
- Typed service boundaries
- Mock/local development repository
- Responsive UI
- Lint validation
- Production build validation

The current implementation uses mock/local data where backend services have not yet been integrated.

---

## 📄 Project Context

**Smart India Hackathon 2026**

**Problem Statement:** 26034

**Problem:** Software System to check compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by scanning products, images and labels.

**Repository Scope:** Frontend Application

The frontend serves as the presentation and interaction layer for the larger AI Compliance Inspector system.

---

## 📜 License

This project is developed as part of the **Smart India Hackathon** project work.