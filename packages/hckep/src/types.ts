export type HCKEPKnowledgeDomain = 
  | 'PREVENTIVE_CARE'
  | 'CHRONIC_DISEASE'
  | 'MEDICATION_SAFETY'
  | 'LAB_INTERPRETATION'
  | 'LIFESTYLE'
  | 'VACCINATION'
  | 'CLINICAL_SCORING'
  | 'HEALTH_EDUCATION';

export type HCKEPStatus = 'DRAFT' | 'PUBLISHED' | 'DEPRECATED';

export interface HCKEPKnowledgeEntry {
  id: string;
  title: string;
  domain: HCKEPKnowledgeDomain;
  version: string;
  status: HCKEPStatus;
  summary: string;
  evidenceSource: string;
  criteria: Record<string, any>;
  publishedAt: Date;
}

export interface HCKEPEvidenceChain {
  id: string;
  recommendationId: string;
  knowledgeVersion: string;
  consultedEntries: HCKEPKnowledgeEntry[];
  triggeringObservations: { metric: string; value: any; timestamp: Date }[];
  confidenceScore: number;
  explainabilitySummary: string;
  generatedAt: Date;
}
