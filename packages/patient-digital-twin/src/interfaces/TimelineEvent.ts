export interface DigitalTwinTimelineEvent {
  id: string;
  timestamp: string;
  category: 'Diagnosis' | 'Lab Report' | 'Risk Change' | 'Guideline Trigger' | 'Referral' | 'Follow-up';
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'severe';
}
