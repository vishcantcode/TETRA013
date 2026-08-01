export type ClinicalEventType =
  | 'PATIENT_REGISTERED'
  | 'DOCUMENT_OCR_PROCESSED'
  | 'CLINICAL_RISK_EVALUATED'
  | 'EXPLANATION_GENERATED'
  | 'REFERRAL_ISSUED'
  | 'PATIENT_EDUCATION_GENERATED'
  | 'DIGITAL_TWIN_UPDATED'
  | 'POPULATION_ANALYTICS_UPDATED';

export interface ClinicalEvent {
  eventId: string;
  type: ClinicalEventType;
  patientId: string;
  timestamp: string;
  payload: any;
}

export type ClinicalEventListener = (event: ClinicalEvent) => void;

export class ClinicalEventBus {
  private listeners: Map<ClinicalEventType, ClinicalEventListener[]> = new Map();

  public subscribe(eventType: ClinicalEventType, listener: ClinicalEventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);
  }

  public publish(event: ClinicalEvent): void {
    const list = this.listeners.get(event.type) || [];
    list.forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        console.error(`[ClinicalEventBus Error publishing ${event.type}]:`, err);
      }
    });
  }
}

export const globalClinicalEventBus = new ClinicalEventBus();
