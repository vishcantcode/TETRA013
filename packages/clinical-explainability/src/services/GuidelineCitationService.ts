import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { GUIDELINE_REFERENCES } from '@healthsense/types';
import { GuidelineCitation } from '../interfaces/Evidence';

export class GuidelineCitationService {
  public static extractCitations(assessment: UnifiedRiskAssessment): GuidelineCitation[] {
    const citations: GuidelineCitation[] = [];

    const diabetes = assessment.diseaseResults.diabetes;
    if (diabetes.riskScore >= 40) {
      citations.push({
        source: 'ADA',
        title: GUIDELINE_REFERENCES.ADA_2024.title,
        version: '2024 Edition',
        section: 'Sec 2 & 6. Glycemic Targets & Prediabetes',
        evidenceLevel: 'Level A (High)',
        clinicalRationale: 'HbA1c ≥ 6.5% establishes Type 2 Diabetes; 5.7%-6.4% establishes Prediabetes.',
        url: GUIDELINE_REFERENCES.ADA_2024.url
      });
      citations.push({
        source: 'ICMR',
        title: GUIDELINE_REFERENCES.ICMR_2023.title,
        version: '2023 Edition',
        section: 'Sec 4. Management Protocol for Indian Populations',
        evidenceLevel: 'Level A (High)',
        clinicalRationale: 'Mandates Indian Diabetes Risk Score (IDRS) screening & glycemic control.',
        url: GUIDELINE_REFERENCES.ICMR_2023.url
      });
    }

    const ckd = assessment.diseaseResults.ckd;
    if (ckd.riskScore >= 40) {
      citations.push({
        source: 'KDIGO',
        title: GUIDELINE_REFERENCES.KDIGO_2023.title,
        version: '2023 Guideline',
        section: 'Sec 1.3 & 1.4. Screening for Diabetic Kidney Disease & Heatmap Staging',
        evidenceLevel: 'Level A (High)',
        clinicalRationale: 'Mandates annual Urine Albumin-to-Creatinine Ratio (UACR) & eGFR testing for diabetics.',
        url: GUIDELINE_REFERENCES.KDIGO_2023.url
      });
    }

    const htn = assessment.diseaseResults.hypertension;
    if (htn.riskScore >= 40) {
      citations.push({
        source: 'AHA',
        title: GUIDELINE_REFERENCES.AHA_2017.title,
        version: '2017 Guideline',
        section: 'Sec 5. Hypertension Diagnosis & Workup Thresholds',
        evidenceLevel: 'Level A (High)',
        clinicalRationale: 'Stage 2 Hypertension defined as SBP ≥ 140 mmHg or DBP ≥ 90 mmHg.',
        url: GUIDELINE_REFERENCES.AHA_2017.url
      });
    }

    const cvd = assessment.diseaseResults.cvd;
    if (cvd.riskScore >= 40) {
      citations.push({
        source: 'WHO',
        title: GUIDELINE_REFERENCES.WHO_2020.title,
        version: '2020 Matrix',
        section: 'South Asia Cardioprotective Risk Matrix',
        evidenceLevel: 'Level B (Moderate)',
        clinicalRationale: 'Evaluates 10-year ASCVD risk based on SBP, Total Cholesterol, Smoking, and Diabetes.',
        url: GUIDELINE_REFERENCES.WHO_2020.url
      });
    }

    return citations;
  }
}
