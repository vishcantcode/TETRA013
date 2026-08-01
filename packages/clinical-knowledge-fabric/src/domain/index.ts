export type RelationshipType = 'CONTRAINDICATES' | 'TREATS' | 'EXACERBATES' | 'CAUSES' | 'SYNERGIZES' | 'ALTERNATIVES';
export type ConceptType = 'DISEASE' | 'MEDICATION' | 'SYMPTOM' | 'LIFESTYLE' | 'INTERVENTION';

export interface EvidenceReference {
  id: string; // e.g., "PMID:123456"
  source: string; // e.g., "PubMed"
  url?: string;
  confidenceScore?: number;
}

export interface TerminologyMapping {
  standard: 'SNOMED' | 'ICD10' | 'RXNORM' | 'LOINC';
  code: string;
  display: string;
}

export interface KnowledgeMetadata {
  version: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  author: string;
}

export interface ClinicalConcept {
  id: string; // Canonical internal CKF ID
  type: ConceptType;
  defaultName: string;
  metadata: KnowledgeMetadata;
  evidence: EvidenceReference[];
  terminology: TerminologyMapping[];
}

export interface ClinicalRelationship {
  id: string;
  sourceConceptId: string;
  targetConceptId: string;
  type: RelationshipType;
  severityWeight: number; // 0.0 to 1.0 (1.0 = Fatal/Strict)
  evidence: EvidenceReference[];
}

export interface ConflictingEvidence {
  conceptId?: string;
  relationshipId?: string;
  conflictDescription: string;
  supportingEvidence: EvidenceReference[];
  opposingEvidence: EvidenceReference[];
}

export interface KnowledgeSnapshot {
  id: string;
  version: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  hash: string;
}
