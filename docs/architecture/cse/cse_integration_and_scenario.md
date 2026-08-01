# Clinical Simulation Engine (CSE)
## Architecture & Design Specification (ADS) - Part 4

> [!NOTE]
> This document details Sections 6 and 7: Integration and Scenario Modeling.

---

## SECTION 6 — INTEGRATION

The CSE sits at a unique intersection of the platform. It consumes from the knowledge and intelligence layers but acts as a provider to the eventual care planning layer.

### 1. Digital Twin
- **Interaction:** The CSE pulls a read-only clone (`DigitalTwinSnapshot`) of the patient's current state. 
- **Constraint:** The CSE *never* writes back to the Digital Twin. Projections are ephemeral mathematical constructs.

### 2. Clinical Knowledge Fabric (CKF)
- **Interaction:** The CSE queries the CKF for deterministic transition rules (e.g., "If condition X exists and intervention Y is applied, what is the expected clinical trajectory?").
- **Constraint:** The CSE must inject its requested temporal context into the CKF's `ActiveContext` middleware to ensure all simulations use the correct historical knowledge snapshot.

### 3. Clinical Reasoning Pipeline (CRP)
- **Interaction:** The CSE executes the CRP in "Sandbox Mode". It feeds the CRP the cloned Digital Twin (with the hypothetical intervention applied) and asks the CRP to reason over it.
- **Constraint:** The CRP must be entirely stateless for this to work. It cannot emit side-effects (like firing external alerts) when running in Sandbox Mode.

### 4. Longitudinal Intelligence Engine (LCIE)
- **Interaction:** The CSE queries the LCIE to establish the patient's baseline velocity (e.g., "Condition X has been worsening at a rate of 10% per month"). The CSE uses this velocity to extrapolate the baseline scenario (the "Do Nothing" scenario).

### 5. Explainability & Confidence Engines
- **Interaction:** The CSE aggregates the Explainability and Confidence traces from the sandboxed CRP executions and bundles them into the final `SimulationScenario`.

---

## SECTION 7 — SCENARIO MODELING

The core value of the CSE is its ability to model and compare *multiple* futures simultaneously.

### The Baseline Scenario (Scenario Zero)
Every simulation request automatically generates a Baseline Scenario.
- **Definition:** The projected clinical trajectory if *no* new interventions are taken.
- **Purpose:** Serves as the control group. All other scenarios are measured as a delta against the baseline.

### Scenario Divergence
When modeling multiple interventions, the CSE executes parallel pipelines.
- **Example:** 
  - Scenario A: Start Medication X.
  - Scenario B: Start Medication Y.
  - Scenario C: Recommend Surgery Z.
- The CSE produces three distinct `SimulationScenario` entities. It does *not* rank them; it merely quantifies their respective `TradeOffAnalysis`.

### Historical Replay
Because medical decisions are heavily audited, the CSE must support perfect historical replay.
1. A clinician in 2026 requests a replay of a simulation ran in 2024.
2. The CSE fetches the exact `DigitalTwinSnapshot` from the 2024 timestamp.
3. The CSE injects `contextDate: 2024` into the CKF, ensuring it uses the 2024 medical guidelines.
4. The CSE runs the pipeline.
5. The cryptographic hash of the new execution must match the `SimulationTrace` hash stored in 2024. If they differ, the platform flags a regulatory integrity breach.
