# Clinical Knowledge Fabric (CKF)
## Implementation Planning & Execution Blueprint (IPEB) - Part 4

> [!NOTE]
> This document details Sections 7 and 8: Implementation Risks and Test Strategy.

---

## SECTION 7 — IMPLEMENTATION RISKS

For each workstream, we identify critical risks and mitigation strategies.

### Workstream A: Core Domain & Contracts
- **Technical Risk (Low):** Over-constraining validation logic.
- **Mitigation:** Rely strictly on type definitions (`interface`) and lightweight constructors.

### Workstream B: Application & Services
- **Performance Risk (High):** Recursive algorithms inside `GraphTraversalService` might cause stack overflows or infinite loops if cycles exist in the data (e.g., A treats B, B causes A).
- **Mitigation:** The traversal algorithm must maintain a `visited` set and enforce the `maxDepth` parameter (default 3) rigidly.

### Workstream C: Infrastructure & Persistence
- **Integration Risk (Medium):** The Recursive CTE queries in PostgreSQL might be too slow for the 20ms SLA.
- **Mitigation:** Implement aggressive caching in `Workstream B`. If PostgreSQL CTEs consistently exceed 50ms, escalate to the ARB to trigger the Neo4j migration early.

### Workstream D: Integration & Pipelines
- **Clinical Safety Risk (High):** The CRP fails to interpret the boolean `isSafe` flag correctly or swallows a `KnowledgeNotFoundError`.
- **Mitigation:** Contract tests (Pact) must explicitly assert that an unsafe response from the CKF results in an aborted reasoning path in the CRP.

---

## SECTION 8 — TEST STRATEGY

Testing the CKF is paramount. We separate the tests into clear, gated phases corresponding to the workstreams.

### 1. Unit Tests (Workstreams A & B)
- **Target:** Domain validation and Service traversal logic.
- **Coverage Goal:** 100% Branch and Statement coverage.
- **Focus:** Ensure `ClinicalRelationship` correctly throws an error if initialized with a severity weight outside `[0.0, 1.0]`. Test `GraphTraversalService` against a static, cyclic in-memory graph to prove it halts correctly.

### 2. Contract Tests (Workstream D)
- **Target:** API schemas and DTOs.
- **Coverage Goal:** 100% of public service boundaries.
- **Focus:** Consumer-driven contract testing. The CRP defines its expectations of `GraphQueryOptions` and `ClinicalRelationship[]`, and the CKF pipeline verifies it satisfies them.

### 3. Integration Tests (Workstream C)
- **Target:** PostgreSQL Repository Adapter.
- **Coverage Goal:** 90% Statement coverage.
- **Focus:** Verify that saving a `KnowledgeSnapshot` with 1,000 nodes and 5,000 edges persists correctly, and that the recursive CTE can retrieve an edge 3 hops away.

### 4. Replay Tests (Cross-cutting)
- **Target:** The `ActiveContext` temporal middleware.
- **Coverage Goal:** N/A (Scenario based).
- **Focus:** 
  1. Insert Snapshot V1 (Date: 2024).
  2. Insert Snapshot V2 (Date: 2025).
  3. Query `GraphTraversalService` with `contextDate = 2024-06-01`.
  4. Assert the result strictly matches Snapshot V1, proving historical replayability.

### 5. Performance Tests (Post-Integration)
- **Target:** E2E system under load.
- **Focus:** Use k6 to hammer the `ConceptResolutionService` and `GraphTraversalService` with 1,000 req/sec. Assert p95 latency < 20ms and p99 latency < 50ms.
