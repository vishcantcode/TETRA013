export interface TwinVersionSnapshot {
  version: string; // e.g. 'v1.0', 'v2.0'
  versionTag: 'v1 Registration' | 'v2 Lab Upload' | 'v3 Follow-up' | 'v4 Medication Change';
  createdAt: string;
  triggeredEvent: string;
  deltaSummary: string[];
}
