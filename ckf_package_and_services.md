# Clinical Knowledge Fabric (CKF)
## Architecture & Design Specification (ADS) - Part 3

> [!NOTE]
> This document details Sections 4, 5, and 8 of the ADS: Package Architecture, Knowledge Services, and API Contracts.

---

## SECTION 4 — PACKAGE ARCHITECTURE

The `@healthsense/clinical-knowledge-fabric` package follows a strict Domain-Driven Design layout, physically separating interface contracts from storage mechanisms.

### Directory Layout
```text
@healthsense/clinical-knowledge-fabric
├── src/
│   ├── domain/        # Immutable entities, value objects, interfaces
│   ├── application/   # Orchestration and use-case workflows
│   ├── services/      # Domain services (e.g. ConceptResolutionService)
│   ├── repositories/  # Abstract interfaces for knowledge storage
│   ├── query/         # Graph traversal and search engine abstractions
│   ├── ontology/      # Terminology mapping and hierarchy parsers
│   ├── validation/    # Fact-checking against invariants
│   ├── versioning/    # Snapshot management and timestamp resolution
│   ├── provenance/    # Evidence citation and audit trails
│   └── errors/        # Typed exceptions (e.g., KnowledgeNotFoundError)
├── tests/             # Contract and Replay testing
└── docs/              # CKF specific ADRs and guides
```

### Dependency Inversion
All external consumers (e.g., `Clinical Reasoning Pipeline`) interact exclusively with `src/application/` or `src/services/`. `repositories/` depend *inward* on `domain/`, ensuring the core knowledge model is agnostic to whether it is stored in Neo4j, PostgreSQL, or an in-memory map.

---

## SECTION 5 — KNOWLEDGE SERVICES

These services form the programmatic API boundary for internal HealthSense modules.

1. **`ConceptResolutionService`**
   - *Purpose:* Given a string, code, or synonym, resolves to the canonical `ClinicalConcept`.
   - *Inputs:* Query string, target terminology (optional), `KnowledgeVersion`.
   - *Outputs:* Standardized `ClinicalConcept`.

2. **`RelationshipTraversalService`**
   - *Purpose:* Navigates the graph (e.g., "Find all medications that exacerbate Condition Y").
   - *Inputs:* Source Concept ID, Edge Type, Depth limit.
   - *Outputs:* Array of `ClinicalRelationship` edges and target concepts.

3. **`TerminologyService`**
   - *Purpose:* Translates external codes (SNOMED, LOINC) into internal CKF IDs and vice versa.

4. **`GuidelineService`**
   - *Purpose:* Retrieves structured `ClinicalGuideline`s applicable to a given `DiseaseConcept` or patient demographic profile.

5. **`ContraindicationService`**
   - *Purpose:* Extremely fast, highly-available lookup to check if a proposed intervention is unsafe.
   - *Inputs:* List of existing interventions/diagnoses, List of proposed interventions.
   - *Outputs:* Array of `Contraindication` violations.

6. **`VersionManager`**
   - *Purpose:* Handles time-travel queries. Resolves a `Date` into the specific `KnowledgeSnapshot` active at that time.

7. **`EvidenceProvenanceService`**
   - *Purpose:* Fetches the underlying medical literature and citations backing a specific relationship or concept.

---

## SECTION 8 — API CONTRACTS

To ensure stability, API request and response objects are strictly typed.

### Example Request Models

```typescript
interface ConceptResolutionRequest {
  query: string;
  contextDate: Date; // Mandatory for version resolution
  filters?: {
    conceptTypes?: string[];
    terminologySystem?: string;
  };
}

interface ContraindicationCheckRequest {
  activeConditions: string[]; // CKF Concept IDs
  activeMedications: string[];
  proposedInterventions: string[];
  contextDate: Date;
}
```

### Example Response Models

```typescript
interface ConceptResolutionResponse {
  canonicalConcept: ClinicalConcept;
  confidenceScore: number;
  activeVersion: KnowledgeVersion;
}

interface ContraindicationCheckResponse {
  isSafe: boolean;
  violations: Contraindication[];
  warnings: string[];
  evidenceIds: string[];
}
```

### Error Contracts
All services must throw typed errors extending `KnowledgeFabricError`.
- `ConceptNotFoundError`: When an ID or code doesn't exist in the given version.
- `VersionResolutionError`: When querying a date before knowledge history began.
- `AmbiguousMappingError`: When a code maps to multiple internal concepts.

### Version Strategy
The CKF does not use typical HTTP API versioning (v1/v2). Because the API is internal to the monorepo platform, breaking interface changes are managed via standard TypeScript refactoring. Instead, "Versioning" refers strictly to the *Clinical Knowledge Version*. Every request must pass a `contextDate` or explicit `snapshotId`, ensuring queries are temporally bound.
