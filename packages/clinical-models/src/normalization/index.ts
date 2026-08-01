export interface RawObservation {
  type: 'symptom' | 'vital' | 'wearable' | 'medication';
  value: any;
  timestamp: Date;
  source: string;
}

export interface NormalizedObservation {
  id: string;
  type: string;
  standardizedValue: any;
  originalValue: any;
  timestamp: Date;
  source: string;
  confidence: number;
}

export class InputNormalizationEngine {
  normalize(raw: RawObservation[]): NormalizedObservation[] {
    return raw.map(r => ({
      id: crypto.randomUUID(),
      type: r.type,
      standardizedValue: this.standardize(r.type, r.value),
      originalValue: r.value,
      timestamp: r.timestamp || new Date(),
      source: r.source,
      confidence: 1.0
    }));
  }

  private standardize(type: string, value: any): any {
    if (typeof value === 'string') return value.trim().toLowerCase();
    return value;
  }
}
