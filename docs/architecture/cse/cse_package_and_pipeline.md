# Clinical Simulation Engine (CSE)
## Architecture & Design Specification (ADS) - Part 3

> [!NOTE]
> This document details Sections 4 and 5: Package Architecture and Simulation Pipeline.

---

## SECTION 4 — PACKAGE ARCHITECTURE

The CSE is structured into bounded contexts to prevent leakage between pure domain logic, the orchestration engine, and external integrations.

### Directory Structure

```text
packages/clinical-simulation-engine/
├── src/
│   ├── domain/           # Core immutable entities (SimulationScenario, TradeOffAnalysis)
│   ├── application/      # Orchestration layer (SimulationManager)
│   ├── simulation/       # Core execution logic for a single projection sandbox
│   ├── scenario/         # Scenario generation and comparison algorithms
│   ├── projection/       # Risk and Benefit outcome calculators
│   ├── timeline/         # Chronological state management
│   ├── uncertainty/      # Missing data modeling and confidence decay algorithms
│   ├── repositories/     # Storage interfaces for persisted simulation traces
│   ├── services/         # Internal domain services
│   ├── validation/       # Input strictness (bounds checking on scenarios)
│   ├── integration/      # Adapters for CKF and CRP
│   ├── testing/          # Utilities for mocking deterministic time
├── docs/                 # (Section 13 Documentation)
```

---

## SECTION 5 — SIMULATION PIPELINE

The core execution path for generating a single `SimulationScenario` follows a strict, sequential pipeline.

### Pipeline Stages

1. **Scenario Generation (`ScenarioGenerationStage`)**
   - Receives the `SimulationRequest`.
   - Deep-clones the provided `DigitalTwinSnapshot` into an ephemeral, in-memory sandbox.
   - Applies the proposed `ClinicalIntervention` to the sandbox twin.

2. **Knowledge Retrieval (`KnowledgeRetrievalStage`)**
   - Queries the CKF via the `integration/ckfAdapter`.
   - Fetches the clinical transition rules and expected progression timelines for the new state.

3. **Clinical Reasoning Integration (`ReasoningIntegrationStage`)**
   - Orchestrates a "ghost execution" of the CRP.
   - Passes the sandboxed twin and the CKF knowledge to the CRP.
   - Captures the CRP's deterministic output (e.g., "In 3 months, based on this new intervention, the CRP predicts condition X will stabilize").

4. **Outcome Projection (`OutcomeProjectionStage`)**
   - Maps the CRP outputs into discrete `ExpectedOutcome` entities over the `ScenarioTimeline`.

5. **Risk Projection (`RiskProjectionStage`)**
   - Analyzes the CKF `CONTRAINDICATES` and `EXACERBATES` edges over the timeline to identify downstream safety hazards triggered by the intervention.

6. **Benefit Projection (`BenefitProjectionStage`)**
   - Analyzes the CKF `TREATS` and `SYNERGIZES` edges to quantify expected health improvements.

7. **Trade-off Analysis (`TradeOffAnalysisStage`)**
   - Synthesizes the Risks and Benefits into a strict comparative matrix (no decision is made, just math).

8. **Confidence Aggregation (`ConfidenceAggregationStage`)**
   - Calculates the overall `UncertaintyProfile`. If the timeline extends beyond the CKF's evidence bounds, uncertainty scales exponentially.

9. **Explainability Assembly (`ExplainabilityAssemblyStage`)**
   - Attaches `SimulationEvidence` (CKF citations) to every projected node on the timeline.

10. **Simulation Snapshot Creation (`SnapshotCreationStage`)**
    - Freezes the entire scenario execution into an immutable `SimulationScenario` object.
    - Generates a cryptographic `SimulationTrace` hash for regulatory replayability.
