export interface ReferralMetrics {
  totalReferralsGenerated: number;
  bySpecialty: { specialty: string; count: number; percentage: number }[];
  byUrgency: { urgency: string; count: number; percentage: number }[];
  referralCompletionRatePercentage: number;
  averageDelayDays: number;
}
