# HealthSense - Hackathon Demo Guide

## Scenario Overview
The platform is pre-seeded with **Patient 001** (58M), presenting with manageable **Hypertension** and **Type 2 Diabetes**. 

## Execution Steps

### 1. Environment Reset
Hit `POST /api/demo/reset` to flush in-memory state.
Hit `POST /api/demo/seed` to deterministically generate Patient 001's Digital Twin snapshot.

### 2. Preventive Intelligence 
Trigger `POST /api/preventive/assessment`.
- The engine will scan the vital history.
- It will detect a `improving` trend in `blood_pressure_sys` (145 -> 138 -> 132).
- It will output a Recommendation to **maintain current medication dose**.

### 3. Workflow Runtime
Trigger `POST /api/chronic/enroll` (Hypertension).
- The engine will execute through the `WorkflowRuntime`.
- It will intercept and process a baseline assessment.

### 4. Medication Safety
Trigger `POST /api/medication/enroll` (NSAID).
- The `MedicationSafetyEngine` will intercept the payload.
- It will read the Digital Twin, identify the Hypertension condition, and flag an interaction alert.

## Observability
All endpoints are wrapped with `x-correlation-id` headers injected via `withObservability` middleware.
Latencies are appended deterministically to `ApiResponse` metadata.
