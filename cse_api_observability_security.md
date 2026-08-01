# Clinical Simulation Engine (CSE)
## Architecture & Design Specification (ADS) - Part 5

> [!NOTE]
> This document details Sections 8, 9, and 10: API Contracts, Observability, and Security.

---

## SECTION 8 — API CONTRACTS

The CSE exposes a strictly versioned, asynchronous API, as simulations may be computationally intensive.

### Request Model (DTO)
```typescript
interface SimulationRequestDTO {
  requestId: string;
  patientId: string;
  digitalTwinVersion: string; // The specific immutable clone ID
  targetTimeframes: string[]; // e.g., ["30d", "90d", "1y"]
  scenarios: {
    scenarioId: string;
    interventions: string[]; // CKF Concept IDs
  }[];
}
```

### Response Model (DTO)
```typescript
interface SimulationResponseDTO {
  requestId: string;
  status: 'COMPLETED' | 'FAILED' | 'NON_DETERMINISTIC';
  baselineScenario: SimulationScenarioDTO;
  interventionScenarios: SimulationScenarioDTO[];
  simulationTraceId: string; // For audit replay
}
```

### Error Handling
- **`NonDeterministicError`**: Thrown if the CRP sandbox yields divergent results on a retry loop, violating the core principle of determinism.
- **`UncertaintyThresholdExceeded`**: Thrown if the CKF projection lacks sufficient clinical evidence to project the requested timeframe. The API returns a `422 Unprocessable Entity` with the uncertainty profile attached.

---

## SECTION 9 — OBSERVABILITY

Because the CSE orchestrates deep recursive calls across the CKF and CRP, observability must be forensic.

### 1. Tracing
- Implement OpenTelemetry distributed tracing.
- A single `SimulationRequest` spawns a root span. Each scenario spawns a child span. Each sandboxed CRP execution spawns a sub-span.
- Traces must carry the `isSandbox=true` tag to ensure monitoring tools do not confuse simulations with live patient reasoning.

### 2. Metrics
- `cse_simulation_duration_ms`: Histogram of execution times.
- `cse_scenario_count`: Counter of scenarios simulated per request.
- `cse_uncertainty_threshold_aborts`: Counter tracking how often the CSE refuses to project due to lack of evidence.

### 3. Replay Diagnostics
- The CSE must dump a `ReplayDiagnosticLog` containing the exact input state (Twin, CKF version, Context Date) used to generate a projection. If a simulation is ever challenged clinically, this log is used to reproduce it.

---

## SECTION 10 — SECURITY

Simulation data contains highly sensitive Protected Health Information (PHI), as it relies on the Digital Twin.

### 1. Replay Protection & Integrity
- **Snapshot Hashing:** The final `SimulationResponseDTO` is serialized and hashed (SHA-256). This hash (`SimulationTrace`) is signed by the CSE's private key and stored in an immutable ledger.
- **Tamper Detection:** If the stored trace hash does not match a recalculated hash upon audit, the system flags a cryptographic integrity violation.

### 2. Access Control
- The CSE does not expose a public API. It is accessible exclusively via internal gRPC/mTLS from authorized modules (e.g., Care Planning).
- Role-Based Access Control (RBAC) ensures only authorized auditing services can trigger a historical replay request.

### 3. Audit Trails
- Every simulation request logs: `Requester ID`, `Patient ID`, `Purpose of Use`, and `SimulationTrace Hash`.
- Sandbox executions do NOT generate live clinical alerts, preventing "alert fatigue" attacks where a malicious actor triggers thousands of critical simulations to flood the clinical dashboard.
