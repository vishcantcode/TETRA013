# Clinical Knowledge Fabric (CKF)
## Architecture & Design Specification (ADS) - Part 1

> [!NOTE]
> This document defines the theoretical foundation for the CKF. It addresses Sections 1 and 2 of the Architecture & Design Specification.

---

## SECTION 1 — PROBLEM DEFINITION

### Why the CKF Exists
As HealthSense scales, the platform relies on multiple intelligent engines (Clinical Reasoning Pipeline, Longitudinal Intelligence, Symptom Intelligence). Currently, clinical knowledge—such as medication contraindications, disease progression markers, and symptom relationships—is implicitly embedded within the reasoning logic or workflow files of these disparate engines. 

The **Clinical Knowledge Fabric (CKF)** exists to centralize, standardize, and govern this clinical knowledge. It acts as the canonical source of truth for all medical facts, ontologies, and guidelines, separating *what the platform knows* from *how the platform reasons*.

### Problems It Solves
- **Knowledge Fragmentation:** Eliminates duplicated clinical rules across multiple intelligence engines.
- **Traceability & Provenance:** Ensures every clinical decision can trace its underlying medical fact back to a validated source (e.g., medical literature, established guidelines).
- **Versioning:** Allows the platform to safely update its clinical knowledge over time without breaking historical reasoning (crucial for replayability).
- **Ontology Agnosticism:** Normalizes disparate medical terminologies (SNOMED CT, ICD-10, LOINC) into a unified internal representation.

### Problems It Explicitly Does NOT Solve
- **Clinical Reasoning:** The CKF does not evaluate patient data or make clinical decisions. It only answers questions about medical facts (e.g., "Does X interact with Y?").
- **Patient Data Storage:** The CKF does not store patient timelines or Digital Twins.
- **Workflow Execution:** The CKF does not manage triage flows or conversational logic.

### Platform Responsibilities
- Provide low-latency, deterministic access to structured clinical concepts and their relationships.
- Maintain a versioned history of all clinical knowledge.
- Expose interfaces for navigating complex medical ontologies.

### Non-Responsibilities
- Making patient-specific inferences.
- Running inference models (LLMs).

---

## SECTION 2 — ARCHITECTURAL PRINCIPLES

1. **Knowledge is Immutable**
   - *Rationale:* Clinical facts cannot change retroactively. Modifying existing knowledge corrupts historical decision replayability.
   - *Implication:* Updates to knowledge produce new versions of a concept; old versions are retained indefinitely.

2. **Knowledge is Versioned**
   - *Rationale:* Medical science evolves. HealthSense must know exactly what clinical guidelines it believed to be true at any specific timestamp in the past.
   - *Implication:* The CKF API requires a `KnowledgeVersion` or `Timestamp` context for all queries.

3. **Reasoning Consumes Knowledge**
   - *Rationale:* The Clinical Reasoning Pipeline (CRP) must remain purely functional (data in, decision out). The CKF provides the static parameters for those functions.
   - *Implication:* The CKF exposes query interfaces, not execution interfaces.

4. **Knowledge Never Contains Workflow Logic**
   - *Rationale:* Coupling medical facts to application UX leads to brittle architecture.
   - *Implication:* A `DiseaseConcept` will list associated symptoms, but it will never dictate *how* to ask a patient about those symptoms.

5. **Provenance is Mandatory**
   - *Rationale:* AI systems in healthcare must be fully transparent.
   - *Implication:* Every relationship and concept must hold an `EvidenceReference` pointing to its origin (e.g., PubMed ID, clinical trial, expert consensus).

6. **Interfaces over Implementations**
   - *Rationale:* The storage backend for the CKF (e.g., Graph Database, Relational DB, In-Memory structure) may change as the system scales.
   - *Implication:* All internal platforms must depend on abstract knowledge interfaces (`ConceptResolutionService`), not direct database clients.

7. **Storage Technology Independence**
   - *Rationale:* Avoid vendor lock-in and allow for localized caching.
   - *Implication:* Data access layers are strictly isolated behind the package boundary.
