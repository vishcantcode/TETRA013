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

  const chwContact = process.env.EMERGENCY_CONTACT_CHW || '+1234567890';
  // Note: Ambulance contact is now fetched dynamically via the Geolocation API in HIGH priority cases

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

      // 2. Dispatch ambulance via Voice to the dynamically identified hospital
      const dynamicAmbulanceContact = hospital.phone;
      const emergencyVoiceScript = `Emergency alert. Dispatch ambulance immediately to coordinates X Y for ${patient.name}, age ${patient.age}. Suspected ${triage.suspected_risk}. ETA to ${hospital.name} is ${hospital.eta}.`;
      await initiateVoiceCall(dynamicAmbulanceContact, emergencyVoiceScript);
      result.actions.push({
        action: 'Twilio Voice: Ambulance Dispatched',
        status: 'success',
        details: `Call initiated dynamically to ${hospital.name} at ${dynamicAmbulanceContact}`,
      });

      // 3. SMS to Community Health Worker
      const smsMessage = `URGENT: ${patient.name} (${patient.age}) experiencing symptoms of ${triage.suspected_risk}. Ambulance dispatched. Please proceed to patient location.`;
      await sendSMS(chwContact, smsMessage);
      result.actions.push({
        action: 'Twilio SMS: CHW Notified',
        status: 'success',
        details: `Message sent to ${chwContact}`,
      });

    } else if (triage.priority === 'MEDIUM') {
      // 1. Auto-schedule PCP appointment (mock calendar logic)
      // In real life, this would call an EHR API (e.g., Epic/Cerner)
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

      // 2. SMS Nudge to patient/caregiver
      const patientNudge = `HealthSense Alert: We noticed some concerning symptoms (${triage.suspected_risk}). We've proactively booked a checkup for you with ${result.appointment.doctor} tomorrow at 10:00 AM.`;
      await sendSMS(chwContact, patientNudge); // Using CHW number for demo purposes
      result.actions.push({
        action: 'Twilio SMS: Patient Nudge Sent',
        status: 'success',
      });
      result.nudge = patientNudge;

    } else {
      // NORMAL Priority
      // 1. Log to Digital Twin (mock db update)
      result.actions.push({
        action: 'Database: Digital Twin Updated',
        status: 'success',
        details: 'Longitudinal health record updated with new baseline.',
      });

      // 2. Proactive Nudge
      // In a full implementation, we'd use Llama 8B here to generate a dynamic nudge.
      // For speed, using a static thoughtful nudge based on the rationale.
      result.nudge = `Great job logging your health today! Keep up the good work. ${triage.rationale}`;
      result.actions.push({
        action: 'UI: Proactive Lifestyle Nudge Generated',
        status: 'success',
      });
    }

    return result;
  } catch (error) {
    console.error('Orchestrator Error:', error);
    // Explicitly throw so the pipeline fails loudly without fallback
    throw new Error('Action Orchestrator failed to execute real-world actions. Clinical Engine Unavailable.');
  }
}
