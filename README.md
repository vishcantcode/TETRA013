# HealthSense

**Intelligent Health Platform** — AI-powered clinical decision support for personalized patient care.

HealthSense is a production healthcare SaaS platform that combines patient digital twins, longitudinal health intelligence, and clinical reasoning pipelines to deliver explainable, actionable health recommendations.

## Architecture

```
Frontend (React + Vite)
  ↓
API Gateway (Express)
  ↓ JWT Auth + RBAC
Backend Services
  ├── Patient Digital Twin
  ├── Workflow Runtime
  ├── Longitudinal Intelligence Engine
  ├── Clinical Decision Platform
  ├── Preventive Intelligence
  ├── Medication Intelligence
  └── Chronic Disease Management
  ↓
PostgreSQL Database
```

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 8+
- Docker & Docker Compose (for database)

### 1. Start Database
```bash
docker compose up -d postgres
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 4. Start Development
```bash
# Start API server (terminal 1)
cd packages/api && pnpm dev

# Start frontend (terminal 2)
cd apps/patient-app && pnpm dev
```

### 5. Open Application
Navigate to `http://localhost:5173`

## Project Structure

```
healthsense/
├── apps/
│   └── patient-app/          # React frontend (Vite)
├── packages/
│   ├── api/                   # Express API server
│   ├── auth/                  # JWT authentication & RBAC
│   ├── db/                    # PostgreSQL schema & repositories
│   ├── patient-digital-twin/  # Patient state management
│   ├── workflow-runtime/      # Clinical workflow engine
│   ├── clinical-decision-platform/  # Decision synthesis
│   ├── clinical-reasoning/    # Reasoning pipeline
│   ├── clinical-models/       # Clinical data models
│   ├── clinical-knowledge-fabric/   # Knowledge graph
│   ├── longitudinal-intelligence/   # Health trend analysis
│   ├── preventive-intelligence/     # Risk & prevention
│   ├── medication-intelligence/     # Medication management
│   ├── chronic-disease/       # Chronic condition tracking
│   ├── confidence/            # Confidence scoring
│   └── explainability/        # AI explainability
├── docker-compose.yml
└── package.json
```

## Key Features

- **Patient Digital Twin** — Versioned, immutable patient state with longitudinal tracking
- **Clinical Reasoning Pipeline** — Multi-stage reasoning with conflict resolution
- **Explainable AI** — Every recommendation comes with evidence chains and confidence scores
- **Workflow Runtime** — Configurable clinical workflow execution engine
- **Preventive Intelligence** — Trend detection, risk analysis, and proactive recommendations
- **Medication Intelligence** — Drug interaction checking and adherence monitoring

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, React Router, Lucide Icons
- **Backend**: Node.js, Express 5, TypeScript
- **Database**: PostgreSQL 15 with JSONB
- **Infrastructure**: Docker, Turborepo, pnpm workspaces
- **Auth**: JWT with RBAC

## License

Proprietary — © 2024 HealthSense. All rights reserved.
