export interface FollowupPlan {
  nextAppointmentDays: number;
  appointmentTimeframeText: string;
  repeatInvestigations: string[];
  lifestyleReviewGoals: string[];
  medicationReviewReminder: string;
  monitoringSchedule: { metric: string; frequency: string }[];
}
