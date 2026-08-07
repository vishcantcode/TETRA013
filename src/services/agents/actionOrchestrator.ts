/**
 * Action Orchestrator — Step 3 of the Agentic Pipeline
 * 
 * Dynamic decision engine based on triage priority.
 * 
 * Uses Geolocation and Twilio services to execute real-world actions.
 */

import { findNearestHospital, type HospitalInfo } from './geolocationService';
import { sendSMS, initiateVoiceCall } from './twilioService';
import type { TriageResult, PatientProfile } from './triageAgent';

export interface ActionTaken {
  action: string;
  status: 'success' | 'failed' | 'pending';
  details?: string;
}

export interface OrchestrationResult {
  priority: 'HIGH' | 'MEDIUM' | 'NORMAL';
  actions: ActionTaken[];
  hospital?: HospitalInfo;
  appointment?: { doctor: string; date: string; time: string };
  nudge?: string;
  isSimulated?: boolean;
}

/**
 * Execute the autonomous orchestration pipeline.
 */
export async function runActionOrchestrator(
  triage: TriageResult,
  patient: PatientProfile
): Promise<OrchestrationResult> {
  const result: OrchestrationResult = {
    priority: triage.priority,
    actions: [],
  };

  const chwContact = process.env.EMERGENCY_CONTACT_CHW || process.env.PATIENT_PHONE_NUMBER || '+916359385870';
  const ambulanceFallback = process.env.EMERGENCY_CONTACT_AMBULANCE || '+919726299017';

  try {
    if (triage.priority === 'HIGH') {
      // 1. Find nearest hospital (mocking lat/lng for demo)
      const hospital = await findNearestHospital(23.0225, 72.5714, triage.suspected_risk);
      result.hospital = hospital;
      result.actions.push({
        action: 'Geolocation: Nearest Hospital Identified',
        status: 'success',
        details: `${hospital.name} (ETA: ${hospital.eta})`,
      });

      // 2. Dispatch ambulance via Voice
      // NOTE: Always use EMERGENCY_CONTACT_AMBULANCE during testing to avoid
      // accidentally calling a real hospital emergency line.
      // In production, swap ambulanceFallback → hospital.phone when available.
      const dynamicAmbulanceContact = ambulanceFallback;
      const callTarget = `Emergency Ambulance Contact (test) — nearest: ${hospital.name}`;
      const emergencyVoiceScript = `Emergency alert. Dispatch ambulance immediately for ${patient.name}, age ${patient.age}. Suspected ${triage.suspected_risk}. Nearest hospital is ${hospital.name}, ETA ${hospital.eta}.`;

      try {
        await initiateVoiceCall(dynamicAmbulanceContact, emergencyVoiceScript);
        result.actions.push({
          action: 'Twilio Voice: Ambulance Dispatched',
          status: 'success',
          details: `Call initiated to ${callTarget} at ${dynamicAmbulanceContact}`,
        });
      } catch (err: any) {
        result.actions.push({
          action: 'Twilio Voice: Ambulance Dispatch Failed',
          status: 'failed',
          details: err.message,
        });
      }


      // 3. SMS to Community Health Worker
      const smsMessage = `URGENT: ${patient.name} (${patient.age}) experiencing symptoms of ${triage.suspected_risk}. Ambulance dispatched. Please proceed to patient location.`;
      try {
        await sendSMS(chwContact, smsMessage);
        result.actions.push({
          action: 'Twilio SMS: CHW Notified',
          status: 'success',
          details: `Message sent to ${chwContact}`,
        });
      } catch (err: any) {
        result.actions.push({
          action: 'Twilio SMS: CHW Notification Failed',
          status: 'failed',
          details: err.message,
        });
      }

    } else if (triage.priority === 'MEDIUM') {
      result.isSimulated = true;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      
      result.appointment = {
        doctor: 'Dr. Sharma (Primary Care)',
        date: dateStr,
        time: '10:00 AM',
      };
      result.actions.push({
        action: 'EHR: Appointment Scheduled',
        status: 'success',
        details: `${result.appointment.doctor} on ${dateStr} at 10:00 AM`,
      });

      // SMS Nudge to patient/caregiver with safe try/catch
      const patientNudge = `HealthSense Alert: We noticed some concerning symptoms (${triage.suspected_risk}). We've proactively booked a checkup for you with ${result.appointment.doctor} tomorrow at 10:00 AM.`;
      try {
        await sendSMS(chwContact, patientNudge);
        result.actions.push({
          action: 'Twilio SMS: Patient Nudge Sent',
          status: 'success',
        });
        result.nudge = patientNudge;
      } catch (err: any) {
        result.actions.push({
          action: 'Twilio SMS: Patient Nudge Sent',
          status: 'failed',
          details: err.message,
        });
        result.nudge = `HealthSense Alert: We noticed some concerning symptoms (${triage.suspected_risk}). Please consult your primary care physician.`;
      }

    } else {
      // NORMAL Priority
      result.isSimulated = true;
      result.actions.push({
        action: 'Database: Digital Twin Updated',
        status: 'success',
        details: 'Longitudinal health record updated with new baseline.',
      });

      result.nudge = `Great job logging your health today! Keep up the good work. ${triage.rationale}`;
      result.actions.push({
        action: 'UI: Proactive Lifestyle Nudge Generated',
        status: 'success',
      });
    }

    return result;
  } catch (error) {
    console.error('Orchestrator Error:', error);
    // Don't throw, just return result so UI can display gracefully
    return result;
  }
}
