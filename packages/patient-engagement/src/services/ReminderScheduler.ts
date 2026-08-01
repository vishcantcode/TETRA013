import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { ReferralDecision } from '@healthsense/clinical-referrals';
import { ReminderPlan, ScheduledReminder } from '../interfaces/ReminderPlan';

export class ReminderScheduler {
  public static scheduleReminders(
    assessment: UnifiedRiskAssessment,
    referralDecision?: ReferralDecision
  ): ReminderPlan {
    const f = assessment.snapshot.features;
    const meds: ScheduledReminder[] = [];
    const labs: ScheduledReminder[] = [];
    const appointments: ScheduledReminder[] = [];

    // 1. Medication Reminders
    if (f.hba1c !== null && f.hba1c >= 6.5) {
      meds.push({
        id: 'med-1',
        type: 'Medication',
        title: 'Antidiabetic Medication (e.g. Metformin)',
        dueDateOrFrequency: 'Daily (Morning & Evening after meals)',
        instructions: 'Take regularly as prescribed by doctor. Do not skip doses.',
        isUrgent: false
      });
    }

    if (f.systolicBP !== null && f.systolicBP >= 140) {
      meds.push({
        id: 'med-2',
        type: 'Medication',
        title: 'Blood Pressure Medication',
        dueDateOrFrequency: 'Daily (Morning at 8:00 AM)',
        instructions: 'Take same time every morning. Check BP weekly.',
        isUrgent: true
      });
    }

    // 2. Investigation Reminders
    if (f.hba1c !== null && f.hba1c >= 7.0) {
      labs.push({
        id: 'lab-1',
        type: 'Lab Investigation',
        title: 'Repeat HbA1c Glycemic Test',
        dueDateOrFrequency: 'In 90 Days',
        instructions: 'Fasting blood sample required.',
        isUrgent: false
      });
    }

    if (f.uacr === null && f.hba1c !== null && f.hba1c >= 6.5) {
      labs.push({
        id: 'lab-2',
        type: 'Lab Investigation',
        title: 'Urine Albumin-to-Creatinine Ratio (UACR)',
        dueDateOrFrequency: 'Within 7 Days',
        instructions: 'First morning urine sample preferred.',
        isUrgent: true
      });
    }

    // 3. Referral / Appointment Reminders
    if (referralDecision && referralDecision.isReferralRequired) {
      referralDecision.referrals.forEach(ref => {
        appointments.push({
          id: `app-${ref.specialty.toLowerCase()}`,
          type: 'Doctor Appointment',
          title: `Specialist Visit: ${ref.specialty}`,
          dueDateOrFrequency: ref.priority.category,
          instructions: `Reason: ${ref.reason.primaryDiagnosis}. Bring all past lab reports.`,
          isUrgent: ref.priority.category === 'Emergency' || ref.priority.category === 'Within 24 Hours' || ref.priority.category === 'Within 48 Hours'
        });
      });
    }

    return {
      medicationReminders: meds,
      investigationReminders: labs,
      appointmentReminders: appointments,
      vaccinationReminders: [
        {
          id: 'vax-1',
          type: 'Vaccination',
          title: 'Annual Influenza (Flu) Vaccine',
          dueDateOrFrequency: 'Annual',
          instructions: 'Recommended for diabetic & hypertensive individuals.',
          isUrgent: false
        }
      ]
    };
  }
}
