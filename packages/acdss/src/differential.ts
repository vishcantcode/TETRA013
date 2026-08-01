// ============================================================================
// ACDSS – Capability 1: Differential Diagnosis Engine
// ============================================================================

import { ACDSSPatientCase, ACDSSDifferentialDiagnosis, RecommendationStrength } from './types';
import { hckep } from '@healthsense/hckep';

interface DiagnosticRule {
  condition: string;
  requiredFindings: { field: keyof ACDSSPatientCase | 'vitalSign' | 'lab'; key: string; check: (v: any) => boolean }[];
  contradictions: { field: keyof ACDSSPatientCase | 'vitalSign' | 'lab'; key: string; check: (v: any) => boolean }[];
  baseConfidence: number;
  guidelineId: string;
  strength: RecommendationStrength;
}

const DIAGNOSTIC_RULES: DiagnosticRule[] = [
  {
    condition: 'Essential Hypertension',
    requiredFindings: [
      { field: 'vitalSign', key: 'Systolic BP', check: (v: number) => v >= 130 },
      { field: 'chronicConditions', key: 'Hypertension', check: (v: string[]) => v.some(c => c.toLowerCase().includes('hypertension')) }
    ],
    contradictions: [
      { field: 'vitalSign', key: 'Systolic BP', check: (v: number) => v < 120 }
    ],
    baseConfidence: 0.88,
    guidelineId: 'gdl-htn-01',
    strength: 'STRONG'
  },
  {
    condition: 'Type 2 Diabetes Mellitus',
    requiredFindings: [
      { field: 'lab', key: 'HbA1c', check: (v: number) => v >= 6.5 },
      { field: 'lab', key: 'Fasting Glucose', check: (v: number) => v >= 126 }
    ],
    contradictions: [
      { field: 'lab', key: 'HbA1c', check: (v: number) => v < 5.7 }
    ],
    baseConfidence: 0.91,
    guidelineId: 'gdl-htn-01',
    strength: 'STRONG'
  },
  {
    condition: 'Chronic Kidney Disease',
    requiredFindings: [
      { field: 'lab', key: 'eGFR', check: (v: number) => v < 60 },
      { field: 'lab', key: 'Creatinine', check: (v: number) => v > 1.2 }
    ],
    contradictions: [
      { field: 'lab', key: 'eGFR', check: (v: number) => v >= 90 }
    ],
    baseConfidence: 0.85,
    guidelineId: 'gdl-htn-01',
    strength: 'MODERATE'
  },
  {
    condition: 'Hyperlipidemia',
    requiredFindings: [
      { field: 'lab', key: 'LDL', check: (v: number) => v >= 160 },
      { field: 'lab', key: 'Total Cholesterol', check: (v: number) => v >= 240 }
    ],
    contradictions: [
      { field: 'lab', key: 'LDL', check: (v: number) => v < 100 }
    ],
    baseConfidence: 0.82,
    guidelineId: 'gdl-prev-01',
    strength: 'MODERATE'
  },
  {
    condition: 'Obesity',
    requiredFindings: [
      { field: 'lab', key: 'BMI', check: (v: number) => v >= 30 }
    ],
    contradictions: [
      { field: 'lab', key: 'BMI', check: (v: number) => v < 25 }
    ],
    baseConfidence: 0.95,
    guidelineId: 'gdl-prev-01',
    strength: 'STRONG'
  },
  {
    condition: 'Obstructive Sleep Apnea',
    requiredFindings: [
      { field: 'symptoms', key: 'snoring', check: (v: string[]) => v.some(s => s.toLowerCase().includes('snoring')) },
      { field: 'symptoms', key: 'daytime sleepiness', check: (v: string[]) => v.some(s => s.toLowerCase().includes('sleepiness') || s.toLowerCase().includes('fatigue')) }
    ],
    contradictions: [],
    baseConfidence: 0.72,
    guidelineId: 'gdl-prev-01',
    strength: 'CONDITIONAL'
  }
];

export class ACDSSDifferentialEngine {

  public evaluate(patientCase: ACDSSPatientCase): ACDSSDifferentialDiagnosis[] {
    const results: ACDSSDifferentialDiagnosis[] = [];

    for (const rule of DIAGNOSTIC_RULES) {
      const supporting: string[] = [];
      const contradicting: string[] = [];
      let matchedCount = 0;

      for (const req of rule.requiredFindings) {
        const matched = this.checkFinding(patientCase, req);
        if (matched) {
          matchedCount++;
          supporting.push(`${req.key} meets diagnostic threshold`);
        }
      }

      for (const contra of rule.contradictions) {
        if (this.checkFinding(patientCase, contra)) {
          contradicting.push(`${contra.key} contradicts diagnosis`);
        }
      }

      if (matchedCount === 0) continue;

      // Confidence = base * (matched / required) adjusted by contradictions
      const matchRatio = rule.requiredFindings.length > 0
        ? matchedCount / rule.requiredFindings.length
        : 0;
      const contraReduction = contradicting.length * 0.15;
      const confidence = Math.max(0, Math.min(1,
        rule.baseConfidence * matchRatio - contraReduction
      ));

      // Also check if condition is already in chronic conditions (confirms)
      if (patientCase.chronicConditions.some(c => c.toLowerCase().includes(rule.condition.toLowerCase().split(' ')[0]))) {
        supporting.push(`Already in patient chronic conditions list`);
      }

      const evidenceRefs = this.getEvidenceReferences(rule.guidelineId);

      results.push({
        condition: rule.condition,
        confidence: parseFloat(confidence.toFixed(3)),
        supportingFindings: supporting,
        contradictingFindings: contradicting,
        evidenceReferences: evidenceRefs,
        recommendationStrength: confidence >= 0.8 ? rule.strength : 'CONDITIONAL'
      });
    }

    // Sort by confidence descending
    results.sort((a, b) => b.confidence - a.confidence);
    return results;
  }

  private checkFinding(
    patientCase: ACDSSPatientCase,
    finding: DiagnosticRule['requiredFindings'][0]
  ): boolean {
    try {
      if (finding.field === 'vitalSign') {
        const vital = patientCase.vitalSigns.find(v => v.metric === finding.key);
        return vital ? finding.check(vital.value) : false;
      }
      if (finding.field === 'lab') {
        const lab = patientCase.laboratoryResults.find(l => l.test === finding.key);
        return lab ? finding.check(lab.value) : false;
      }
      if (finding.field === 'symptoms') {
        return finding.check(patientCase.symptoms);
      }
      if (finding.field === 'chronicConditions') {
        return finding.check(patientCase.chronicConditions);
      }
      return false;
    } catch {
      return false;
    }
  }

  private getEvidenceReferences(guidelineId: string): string[] {
    const entry = hckep.getRepository().getLatest(guidelineId);
    if (!entry) return [`guideline:${guidelineId}`];
    return [`${entry.title} (${entry.evidenceSource}, ${entry.version})`];
  }
}
