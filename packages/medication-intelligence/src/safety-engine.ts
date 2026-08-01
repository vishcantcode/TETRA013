import { pool } from '@healthsense/db';
import { MedicationCourse, MedicationAlert } from './domain';
import { PatientTwin } from '@healthsense/patient-digital-twin';
import crypto from 'node:crypto';

export class MedicationSafetyEngine {
  public async analyzeSafety(courses: MedicationCourse[], twin: PatientTwin): Promise<MedicationAlert[]> {
    const alerts: MedicationAlert[] = [];

    // Duplicate therapy detection
    const activeNames: Record<string, string[]> = {};
    courses.filter(c => c.status === 'active').forEach(c => {
      const name = (c.medication?.genericName || c.medication?.name || 'unknown').toLowerCase();
      if (!activeNames[name]) activeNames[name] = [];
      activeNames[name].push(c.id);
    });

    Object.entries(activeNames).forEach(([name, ids]) => {
      if (ids.length > 1) {
        alerts.push({
          id: crypto.randomUUID(),
          type: 'duplicate_therapy',
          severity: 'high',
          description: `Duplicate therapy detected for generic ingredient: ${name}`,
          involvedMedications: ids
        });
      }
    });

    // Dynamic disease-medication conflicts mapped from Knowledge Fabric
    const conditions = (twin?.clinicalHistory?.pastConditions || []).map((c: any) => (typeof c === 'string' ? c : c.condition || '').toLowerCase());
    
    for (const course of courses.filter(c => c.status === 'active')) {
       const medName = course.medication?.genericName || course.medication?.name || '';
       if (!medName) continue;

       // Lookup interactions from the canonical fabric
       const res = await pool.query(
         "SELECT data FROM knowledge_concepts WHERE data->>'category' = 'MedicationContraindication' AND data->>'medicationName' ILIKE $1",
         [medName]
       );

       for (const row of res.rows) {
         const contraindication = row.data;
         if (conditions.includes(contraindication.contraindicatedCondition?.toLowerCase())) {
           alerts.push({
             id: crypto.randomUUID(),
             type: 'contraindication',
             severity: 'critical',
             description: `Medication ${medName} is contraindicated in condition: ${contraindication.contraindicatedCondition}`,
             involvedMedications: [course.id]
           });
         }
       }
    }

    return alerts;
  }
}
