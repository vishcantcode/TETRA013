export type ReferralPriorityCategory =
  | 'Emergency'
  | 'Within 24 Hours'
  | 'Within 48 Hours'
  | 'Within 7 Days'
  | 'Routine'
  | 'Annual Review';

export interface ReferralPriority {
  category: ReferralPriorityCategory;
  urgencyExplanation: string;
  recommendedTimeframeDays: number;
}
