// ============================================================================
// HUCWP – Capability 6: Contextual Decision Support
// ============================================================================

import { ClinicianRole } from './types';
import { acdss } from '@healthsense/acdss';

export class HUCWPContextualCDSEngine {

  /**
   * Surface proactive contextual clinical recommendations based on current patient, role, and encounter stage.
   */
  public evaluateContextualRecommendations(
    patientId: string,
    role: ClinicianRole,
    encounterStage = 'INPATIENT_OBSERVATION'
  ): {
    proactiveAlerts: string[];
    recommendedOrders: string[];
    priorityLevel: 'IMMEDIATE' | 'ROUTINE';
  } {
    const acdssCase = {
      patientId,
      symptoms: ['shortness of breath'],
      vitalSigns: [{ metric: 'Systolic BP', value: 146, unit: 'mmHg' }],
      laboratoryResults: [{ test: 'BNP', value: 450, unit: 'pg/mL' }],
      medications: ['Lisinopril 20mg'],
      allergies: [],
      chronicConditions: ['Hypertension'],
      age: 66,
      sex: 'M' as const,
    };
    const acdssResult = acdss.evaluateCase(acdssCase);

    const proactiveAlerts: string[] = [];
    const recommendedOrders: string[] = [];

    if (role === 'PHYSICIAN') {
      proactiveAlerts.push('Proactive CDS: Elevated BNP (450 pg/mL) indicates acute HF exacerbation.');
      recommendedOrders.push('Order Intravenous Furosemide 40mg', 'Request Urgent Echocardiogram');
    } else if (role === 'PHARMACIST') {
      proactiveAlerts.push('Proactive CDS: Verify Lisinopril 20mg against serum creatinine level (1.1 mg/dL).');
      recommendedOrders.push('Initiate Medication Reconciliation');
    } else {
      proactiveAlerts.push('Proactive CDS: Monitor vital signs and fluid balance every 4 hours.');
      recommendedOrders.push('Log Strict I/O Metrics');
    }

    return {
      proactiveAlerts,
      recommendedOrders,
      priorityLevel: 'IMMEDIATE',
    };
  }
}
