# HealthSense AI CDSS

> **Enterprise Clinical Decision Support System & Patient Digital Twin Platform**  
> AI-powered, explainable, real-time clinical decision intelligence for early chronic disease detection in primary healthcare.

![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)
![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.4-646cff?logo=vite)
![pnpm](https://img.shields.io/badge/pnpm-workspaces-f69220?logo=pnpm)
![Turborepo](https://img.shields.io/badge/Turborepo-2.0-ef4444?logo=turborepo)
![License](https://img.shields.io/badge/License-Proprietary-green)

---

## 🌟 Executive Overview

**HealthSense AI** is a production-grade Clinical Decision Support System (CDSS) engineered specifically to address early detection of non-communicable chronic diseases (Type 2 Diabetes, Hypertension, Stage 1–5 CKD, ASCVD, and Stroke).

Designed for high-throughput Primary Healthcare Centers (PHCs) in India, HealthSense AI combines **deterministic clinical risk scoring**, **SHAP-inspired explainability**, **FHIR R4 interoperability**, **interactive anatomical Digital Twins**, and **multilingual vernacular patient education** into a sub-50ms React + TypeScript monorepo architecture.

---

## 📐 System Architecture

HealthSense AI uses a domain-driven monorepo architecture managed via `pnpm` workspaces and `Turborepo`. Core prediction and explainability logic is strictly decoupled from presentation frameworks, enabling multi-target deployments (Web Workstations, Edge Workers, microservices, or CLI tooling).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND PRESENTATION LAYER                      │
│                apps/patient-app (React 18 + Vite + TypeScript)          │
│   ClinicianDashboard | DigitalTwinPage | Landing | AICommandBar | OCR   │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       STATE ORCHESTRATION LAYER                         │
│                    src/context/CDSSContext.tsx                          │
│         Sub-50ms Memoized Engine Execution (React useMemo)              │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  CLINICAL INTELL.    │  │ EXPLAINABILITY ENG.  │  │  REFERRAL ENGINE     │
│ @healthsense/        │  │ @healthsense/        │  │ @healthsense/        │
│ clinical-intelligence│  │clinical-explainabil. │  │ clinical-referrals   │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
           │                         │                         │
           └─────────────────────────┼─────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    DIGITAL TWIN & POPULATION LAYER                      │
│   @healthsense/patient-digital-twin  |  @healthsense/population-health   │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       FOUNDATIONAL DATA MODELS                          │
│     @healthsense/clinical-models  |  @healthsense/types & utils         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Monorepo Package Breakdown

The project is structured under the `pnpm` workspace protocol (`packages/*` and `apps/*`):

### 🚀 Applications (`apps/`)

- **`apps/patient-app`**: The primary clinician workstation web application built with **React 18**, **TypeScript**, and **Vite**. Features interactive organ state visualizations, multi-disease risk gauges, what-if intervention simulation, guideline drawers, and command palette triggers.

### 🧠 Core Domain Packages (`packages/`)

| Package Name | Purpose & Functionality |
| :--- | :--- |
| **`@healthsense/clinical-models`** | FHIR R4 domain models (`FHIRPatient`, `FHIRObservation`, `FHIRCondition`, `FHIRServiceRequest`) and realistic demo patient profile bundles. |
| **`@healthsense/clinical-intelligence`** | Deterministic 5-disease risk engines (Diabetes, Hypertension, CKD, CVD, Stroke), feature vector normalizers, and composite risk aggregators. |
| **`@healthsense/clinical-explainability`** | SHAP-style feature attribution calculations, guideline lineage citation extraction (ICMR, ADA, KDIGO), confidence calibration, and clinician narrative generators. |
| **`@healthsense/clinical-referrals`** | Urgency priority evaluators, specialist matchers, FHIR `ServiceRequest` builders, and follow-up schedule generators. |
| **`@healthsense/patient-digital-twin`** | Anatomical organ state map, longitudinal biomarker trend engine, disease progression trajectory projections, and interactive what-if intervention simulator. |
| **`@healthsense/patient-engagement`** | Personalized, plain-language patient education generator with localized vernacular support (**English**, **Hindi**, **Gujarati**). |
| **`@healthsense/population-health`** | Anonymized district-level epidemiological analytics, disease risk heatmaps, screening gap identification, and healthcare resource planning engine. |
| **`@healthsense/medical-document-intelligence`** | OCR lab report processing engine for parsing blood panels and vitals into FHIR `Observation` resources. |
| **`@healthsense/workflow-runtime`** | Dynamic clinical workflow state machine executor and policy enforcement engine. |
| **`@healthsense/security`** | Input sanitization, encryption helpers, security header configurations, and audit logging primitives. |
| **`@healthsense/types`** & **`@healthsense/utils`** | Shared domain interface definitions, normalization logic, date utilities, and ID generators. |

---

## 🔬 Clinical Guidelines & Standards Implemented

HealthSense AI engines base all predictions, confidence calculations, and referrals on authoritative international and Indian national medical guidelines:

- 🩺 **ICMR 2023 Guidelines** — Indian Council of Medical Research Guidelines for Management of Type 2 Diabetes & Hypertension.
- 🩸 **ADA 2024 Standards of Care** — American Diabetes Association diagnostic & HbA1c threshold classifications.
- 🫘 **KDIGO 2023 Guidelines** — Kidney Disease: Improving Global Outcomes staging for CKD based on eGFR & UACR.
- 🫀 **AHA / ACC ASCVD Guidelines** — American Heart Association 10-Year Cardiovascular Risk Estimator standards.
- 🌐 **HL7 FHIR R4 Standard** — Full interoperability using standardized JSON resource schemas.

---

## ⚡ Quick Start & Development Setup

### Prerequisites

- **Node.js**: `^18.18.0` or `^20.0.0`
- **pnpm**: `^8.0.0` or `^9.0.0`

### 1. Repository Setup

```bash
# Clone repository
git clone https://github.com/vishcantcode/TETRA013.git
cd TETRA013

# Install workspace dependencies
pnpm install
```

### 2. Run Workspace Verification

Verify that all packages compile without TypeScript or resolution errors:

```bash
# Type-check entire workspace
pnpm --filter @healthsense/patient-app exec tsc --noEmit
```

### 3. Launch Development Server

Launch the Vite development server for the clinical application:

```bash
# Start dev server
pnpm --filter @healthsense/patient-app dev
```

Navigate to **`http://localhost:5173`** in your browser.

---

## 🔄 End-to-End Execution Flow

When a clinician loads or updates a patient profile, information moves synchronously through our sub-50ms processing pipeline:

```
[Patient Data / Lab Report]
             │
             ▼
 1. Feature Extraction & Normalization (@healthsense/clinical-intelligence)
             │
             ▼
 2. 5-Disease Risk Evaluation (Diabetes, HTN, CKD, CVD, Stroke)
             │
             ▼
 3. Unified Composite Risk Aggregation
             │
             ▼
 4. SHAP Feature Attribution & Guideline Extraction (@healthsense/clinical-explainability)
             │
             ▼
 5. Referral Urgency & FHIR ServiceRequest Creation (@healthsense/clinical-referrals)
             │
             ▼
 6. Multilingual Vernacular Guidance Synthesis (@healthsense/patient-engagement)
             │
             ▼
 7. Anatomical Digital Twin & Progression Simulation (@healthsense/patient-digital-twin)
             │
             ▼
 8. Anonymized District Aggregation (@healthsense/population-health)
```

---

## ⚙️ Technology Stack

| Component | Selected Technology | Purpose |
| :--- | :--- | :--- |
| **Monorepo Management** | `pnpm` Workspaces + Turborepo | Isolated package boundaries, hard-linked dependencies, and cached builds. |
| **Frontend Framework** | React 18 + TypeScript (Strict) | Concurrent UI rendering, static type safety across packages. |
| **Build Tooling** | Vite 5 | Instant ESM development server, fast HMR, and Rollup production bundling. |
| **Design System** | Custom Vanilla CSS Tokens | Zero runtime extraction overhead, dark mode glassmorphism, native CSS Grid/Flexbox. |
| **Interoperability** | HL7 FHIR R4 Schema Definitions | Standardized clinical data contracts (`FHIRPatient`, `FHIRObservation`). |
| **State Orchestration** | React Context API (`CDSSContext`) | Top-down memoized pipeline execution with sub-50ms latency. |
| **Iconography** | Lucide React | Lightweight, tree-shakeable SVG icon components. |

---

## 🧪 Testing & Verification

Run package-level unit tests and architecture verification scripts:

```bash
# Execute package tests via Vitest / TypeScript runners
pnpm test

# Run architecture verification script
npx tsx scripts/test-master-architecture.ts
```

---

## 🛡️ License & Copyright

Proprietary Software — © 2026 **HealthSense AI**. All rights reserved.
