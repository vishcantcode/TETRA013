# Clinical Knowledge Fabric (CKF)
## Implementation Planning & Execution Blueprint (IPEB) - Part 3

> [!NOTE]
> This document details Sections 5 and 6: Data Model Plan and Integration Plan.

---

## SECTION 5 — DATA MODEL PLAN

The CKF relies on a pre-populated, versioned dataset. The implementation must include a robust seeding and migration strategy.

### 1. Entity Creation Order
Data ingestion scripts must execute in the following strict order to satisfy foreign key and graph edge constraints:
1. **`KnowledgeSnapshot`**: Establish the version ID and timestamp.
2. **`EvidenceReference`**: Load the citations and DOIs.
3. **`ClinicalConcept`**: Load the nodes (Diseases, Medications, Symptoms) and map them to their `EvidenceReference`s.
4. **`ClinicalRelationship`**: Load the edges linking the `ClinicalConcept`s together.

### 2. Seed Data Strategy
For Milestone 1 and 2, the `InMemoryKnowledgeRepository` will be seeded with a static JSON file containing a highly curated "Golden Path" dataset (e.g., 50 diseases, 100 medications, and their interactions, primarily focusing on Cardiology and Endocrinology to support existing HealthSense capabilities).

### 3. Knowledge Version Initialization
Upon startup, the repository runs an initialization check. If no `KnowledgeSnapshot` exists, it triggers the Seed Data Script to create `Snapshot v1.0.0` with `effectiveFrom = Date.now()`.

### 4. Rollback Strategy
Because knowledge is immutable, we do **not** `DELETE` or `UPDATE` records.
To "rollback" a flawed knowledge update, the Data Engineering team will issue a `REVERT` command. This creates a *new* `KnowledgeSnapshot` (e.g., `v1.0.2`) whose contents are an exact clone of the safe snapshot (e.g., `v1.0.0`). The `effectiveFrom` date is set to `Date.now()`, ensuring the flawed `v1.0.1` snapshot remains preserved in history for audit purposes, but is no longer the "active" snapshot.

---

## SECTION 6 — INTEGRATION PLAN

The CKF is a passive, highly-available query engine. It does not push events; it responds to queries from the intelligence engines.

### 1. Integration with Clinical Reasoning Pipeline (CRP)

- **Trigger:** During the `Validation` or `Safety` stage of the CRP execution.
- **Input:** The CRP passes proposed `ClinicalHypothesis` actions (e.g., "Recommend Lisinopril") and the patient's current active condition IDs. The temporal context (`contextDate`) is automatically injected by the `ActiveContext` middleware.
- **Output:** The CKF `GraphTraversalService` returns a boolean `isSafe` and an array of `ClinicalRelationship` edges of type `CONTRAINDICATES`.
- **Failure Mode:** CKF Timeout (>50ms) or CKF Unavailable.
- **Recovery Strategy:** The CRP must fail *closed*. If the CKF cannot be reached to verify safety, the CRP must abort the hypothesis and escalate to human review. It must never assume a medication is safe simply because the CKF didn't respond.

### 2. Integration with Longitudinal Intelligence Engine (LCIE)

- **Trigger:** When reconstructing the `PatientTimeline` from raw `HealthSnapshot`s.
- **Input:** Raw symptom strings or unmapped medication names.
- **Output:** The CKF `ConceptResolutionService` returns the canonical `ClinicalConcept.id`.
- **Failure Mode:** Unmapped string (e.g., "Patient reports fuzzy head").
- **Recovery Strategy:** LCIE logs an `UnmappedConceptWarning`, leaves the string as raw text in the timeline, and flags it for async review by the medical ontology team.

### 3. Integration with Explainability Engine

- **Trigger:** When generating the final `ExplanationSummary` for the user or clinician.
- **Input:** The `EvidenceReference.id` attached to the reasoning path.
- **Output:** The CKF returns the full citation (Title, Source, URL) for the medical guideline.
- **Failure Mode:** Reference ID not found.
- **Recovery Strategy:** Fail gracefully. Omit the academic citation from the UI but preserve the reasoning text.
