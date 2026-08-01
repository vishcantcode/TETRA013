export interface ScheduledReminder {
  id: string;
  type: 'Medication' | 'Lab Investigation' | 'Doctor Appointment' | 'Referral' | 'Vaccination';
  title: string;
  dueDateOrFrequency: string;
  instructions: string;
  isUrgent: boolean;
}

export interface ReminderPlan {
  medicationReminders: ScheduledReminder[];
  investigationReminders: ScheduledReminder[];
  appointmentReminders: ScheduledReminder[];
  vaccinationReminders: ScheduledReminder[];
}
