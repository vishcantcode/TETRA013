# Clinical Reasoning Pipeline (CRP)

## Overview
The Clinical Reasoning Pipeline (`@healthsense/clinical-reasoning`) is the deterministic reasoning backbone of the HealthSense platform. It processes raw clinical evidence through a strict, reproducible 10-stage pipeline to generate a `FinalClinicalDecision`.

## Core Principles
1. **Immutability**: Stages receive immutable input and produce immutable output.
2. **Determinism**: Identical inputs must yield identical decisions.
3. **Traceability**: Every mutation is logged in a `ReasoningTrace`.
4. **Safety**: Invalid or low-confidence evidence is rejected prior to synthesis.

## 10-Stage Pipeline
1. **Evidence Collection**: Gathers `ReasoningRequest` payloads into raw `EvidenceBundle`s.
2. **Evidence Normalization**: Standardizes dates, timestamps, units, and bounds.
3. **Evidence Validation**: Verifies schema integrity; rejects missing fields.
4. **Evidence Prioritization**: Scores bundles (0-100) based on confidence thresholds.
5. **Hypothesis Generation**: Infers `ClinicalHypothesis` constructs from prioritized evidence.
6. **Clinical Reasoning**: Evaluates hypotheses to propose actionable interventions.
7. **Safety Validation**: Evaluates confidence thresholds against a strict safety mode.
8. **Decision Synthesis**: Constructs the `DecisionDraft` featuring severity and priority.
9. **Explainability Assembly**: Generates human/machine readable explanations linking back to the `traceId`.
10. **Metrics Export**: Orchestrator emits latencies and event counts via `MetricsCollector`.

## Replay Engine
The `ReasoningReplayService` allows any historical `ReasoningContext` and `ReasoningRequest` to be re-run to verify determinism and isolate regression bugs. Identical inputs will hash to identical `FinalClinicalDecision` artifacts.
