import { ReferralItem } from './ReferralSummary';
import { FollowupPlan } from './FollowupPlan';

export interface ReferralDecision {
  patientId: string;
  evaluatedAt: string;
  isReferralRequired: boolean;
  overallUrgency: 'Emergency' | 'Within 24 Hours' | 'Within 48 Hours' | 'Within 7 Days' | 'Routine' | 'Annual Review';
  referrals: ReferralItem[];
  followupPlan: FollowupPlan;
  conflictResolutionNotes?: string;
  summaryNote: string;
}
