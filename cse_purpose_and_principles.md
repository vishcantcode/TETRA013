# Clinical Simulation Engine (CSE)
## Architecture & Design Specification (ADS) - Part 1

> [!NOTE]
> This document details Sections 1 and 2: Purpose and Architectural Principles.

---

## SECTION 1 — PURPOSE

### Why a Simulation Engine is Required
The HealthSense platform possesses deterministic reasoning capabilities via the Clinical Reasoning Pipeline (CRP). However, reasoning evaluates *current* state. Healthcare requires evaluating *future* states. To safely formulate a complex care plan, the system must project the outcomes, risks, and trade-offs of multiple competing interventions. The Clinical Simulation Engine (CSE) fulfills this by providing a sandbox to test "what-if" clinical scenarios deterministically.

### Definitions
- **Reasoning (CRP):** "Given this patient's state, what is true right now?" (e.g., Patient is hypertensive).
- **Prediction (Machine Learning):** "Based on population statistics, what might happen?" (e.g., 20% chance of stroke in 5 years).
- **Simulation (CSE):** "If we apply Intervention X, how does the deterministic clinical state shift over Timeline Y based on known clinical guidelines?"

### Responsibilities
- Generate bounded, multi-path scenario projections.
- Orchestrate isolated, sandboxed executions of the CRP for each scenario.
- Calculate clinical trade-offs (benefits vs. risks).
- Quantify clinical uncertainty for projected paths.

### Explicit Non-Responsibilities
- **NO Decision Making:** The CSE does NOT choose the best path. It only presents the simulated outcomes.
- **NO State Mutation:** The CSE does NOT modify the `PatientDigitalTwin`. All simulations run on cloned, ephemeral twin states.
- **NO Probabilistic Guessing:** The CSE does not invent futures; it projects strictly based on facts provided by the Clinical Knowledge Fabric (CKF).

### Relationship with CKF and CRP
- **CKF:** Provides the temporal knowledge graphs and transition rules used to project state changes.
- **CRP:** The CSE acts as a recursive orchestrator, creating a sandbox `DigitalTwin`, applying a proposed intervention, and asking the CRP to evaluate the new state.

---

## SECTION 2 — ARCHITECTURAL PRINCIPLES

1. **Simulation is Deterministic When Inputs are Identical**
   - *Rationale:* Medical software must be verifiable. If the CSE is given the same Digital Twin, the same CKF snapshot, and the same intervention, the output trajectory must be byte-for-byte identical.
2. **Simulations are Immutable**
   - *Rationale:* Once a scenario is simulated and returned, its projection cannot be altered. A new projection requires a new simulation request.
3. **Every Scenario is Reproducible**
   - *Rationale:* Regulatory audits require proving *why* a specific simulation yielded a specific result years after the fact.
4. **Simulations Never Modify the Digital Twin**
   - *Rationale:* Sandboxing guarantees clinical safety. Projections must never leak into the patient's actual longitudinal record.
5. **Simulation Outputs are Explainable**
   - *Rationale:* A projected risk metric is useless without the clinical evidence (citations from CKF) backing it.
6. **Clinical Uncertainty is Explicit**
   - *Rationale:* If the CKF lacks data for a long-term projection, the CSE must gracefully degrade and emit an `UncertaintyProfile`, rather than hallucinating an outcome.
7. **Simulation is Independent of Care Planning**
   - *Rationale:* The CSE provides the map; the future Care Planning Module chooses the route. Mixing these concerns violates Single Responsibility.
