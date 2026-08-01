import { describe, it, expect } from 'vitest';
import {
  MedicationStateSchema,
  validateMedicationState,
  parseMedicationState,
  createMedicationState
} from '../../src/domain';

describe('EWP-002: MedicationState Domain Model', () => {
  const validPatientId = '123e4567-e89b-12d3-a456-426614174000';

  it('creates a valid MedicationState entity via factory', () => {
    const medState = createMedicationState({
      patientId: validPatientId,
      rxNormCode: '860975',
      name: 'Lisinopril 10mg Oral Tablet',
      dosage: '10mg',
      frequency: 'daily'
    });

    expect(medState.id).toBeDefined();
    expect(medState.patientId).toBe(validPatientId);
    expect(medState.rxNormCode).toBe('860975');
    expect(medState.dosage).toBe('10mg');
    expect(medState.plasmaConcentrationEst).toBe(1.0);
    expect(medState.active).toBe(true);
  });

  it('validates a complete MedicationState payload successfully', () => {
    const data = {
      id: '987e6543-e21b-12d3-a456-426614174999',
      patientId: validPatientId,
      rxNormCode: '855332',
      name: 'Metformin 500mg',
      dosage: '500mg',
      frequency: 'twice daily',
      plasmaConcentrationEst: 0.85,
      lastAdministeredAt: '2026-07-26T08:00:00.000Z',
      active: true
    };

    const validated = validateMedicationState(data);
    expect(validated.rxNormCode).toBe('855332');
    expect(validated.plasmaConcentrationEst).toBe(0.85);
  });

  it('returns null on invalid parseMedicationState', () => {
    expect(parseMedicationState({ rxNormCode: '' })).toBeNull();
  });
});
