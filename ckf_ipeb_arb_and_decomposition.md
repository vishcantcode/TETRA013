# Clinical Knowledge Fabric (CKF)
## Implementation Planning & Execution Blueprint (IPEB) - Part 1

> [!NOTE]
> This document details Sections 1 and 2: ARB Changes and Implementation Decomposition.

---

## SECTION 1 — APPLY ARB CHANGES

The Architecture Review Board (ARB) returned an `APPROVED WITH CHANGES` decision for Phase 14A. The following architectural modifications are mandatory for Phase 14B.

### 1. Collapse `Contraindication` into `ClinicalRelationship`
- **Original Design:** `Contraindication` existed as a distinct top-level entity and was served by a dedicated `ContraindicationService`.
- **Approved Modification:** Remove the `Contraindication` entity and service. Implement a generic `ClinicalRelationship` with a `type: 'CONTRAINDICATES'`. Expand `RelationshipTraversalService` to handle contraindication queries generically.
- **Rationale:** Hardcoding specific relationship types into the domain model violates the Open/Closed Principle.
- **Expected Benefit:** We can seamlessly add `SYNERGIZES`, `INTERACTS_WITH`, and `ALTERNATIVES` without altering the domain layer.
- **Risk if Ignored:** Domain model bloat and service duplication.

### 2. Context Injection Middleware
- **Original Design:** `contextDate` (for temporal versioning) was required explicitly on every service method signature.
- **Approved Modification:** Introduce `ActiveContext` via an async local storage middleware (or dependency injection scope). The Workflow Runtime sets it once per session, and CKF services read it implicitly.
- **Rationale:** Passing temporal context manually is highly error-prone (Developer Experience).
- **Expected Benefit:** Engineers cannot accidentally query the "current" knowledge base while auditing a historical decision.
- **Risk if Ignored:** Silent, impossible-to-debug temporal reasoning bugs in production.

### 3. Package Consolidation
- **Original Design:** Granular DDD packages (`ontology/`, `relationships/`, `validation/`, `versioning/`).
- **Approved Modification:** Collapse into three core packages: `domain/`, `application/` (containing validation and versioning), and `infrastructure/` (repositories).
- **Rationale:** The original granularity was over-engineered for a startup.
- **Expected Benefit:** Faster onboarding and fewer circular dependencies.
- **Risk if Ignored:** Maintenance paralysis.

### 4. Pragmatic Storage Strategy
- **Original Design:** Neo4j Graph Database from Day 1.
- **Approved Modification:** Implement an abstract `KnowledgeRepository` interface, but back it initially with PostgreSQL/SQLite using recursive Common Table Expressions (CTEs) for graph traversal.
- **Rationale:** Lowers initial DevOps burden while preserving architectural purity.
- **Expected Benefit:** Faster time-to-market.
- **Risk if Ignored:** Weeks wasted on infrastructure provisioning.

---

## SECTION 2 — IMPLEMENTATION DECOMPOSITION

Phase 14B will be executed via parallel workstreams by independent engineering teams.

### Workstream A: Core Domain & Contracts (The Foundation)
- **Purpose:** Establish the absolute, immutable types and interfaces.
- **Inputs:** CKF ADS (Phase 14A).
- **Outputs:** `src/domain/*`, `src/contracts/*`.
- **Dependencies:** None.
- **Acceptance Criteria:** Types compile; 100% unit test coverage on validation invariants (e.g., entity constructors).

### Workstream B: Application & Services (The Engine)
- **Purpose:** Implement the query logic, traversal algorithms, and `ActiveContext` middleware.
- **Inputs:** Workstream A.
- **Outputs:** `src/application/ConceptResolutionService.ts`, `GraphTraversalService.ts`, `ActiveContext.ts`.
- **Dependencies:** Blocked by Workstream A.
- **Acceptance Criteria:** Services can traverse mock data trees successfully and correctly throw errors when context is missing.

### Workstream C: Infrastructure & Persistence (The Storage)
- **Purpose:** Build the PostgreSQL/SQLite repository adapters utilizing CTEs for traversal.
- **Inputs:** Workstream A repository interfaces.
- **Outputs:** `src/infrastructure/SqlKnowledgeRepository.ts`.
- **Dependencies:** Blocked by Workstream A. Can execute in parallel with Workstream B.
- **Acceptance Criteria:** Integration tests prove the adapter correctly saves and retrieves versioned concepts and relationships.

### Workstream D: Integration & Pipelines (The Consumer)
- **Purpose:** Wire the CKF into the Clinical Reasoning Pipeline (CRP) and LCIE.
- **Inputs:** Workstream B.
- **Outputs:** Updates to `@healthsense/clinical-decision-platform` and API endpoints.
- **Dependencies:** Blocked by Workstreams B & C.
- **Acceptance Criteria:** End-to-end API tests prove the CRP correctly halts execution when a contraindication is detected via the CKF.
