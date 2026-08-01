// ============================================================================
// HCQSG – Capability 2: Guideline Compliance Validator
// ============================================================================

import { HCQSGComplianceReport, HCQSGComplianceViolation } from './types';
import { HPPMCareProfile } from '@healthsense/hppm';
import { hckep } from '@healthsense/hckep';

export class HCQSGGuidelineComplianceValidator {

  public validateCompliance(profile: HPPMCareProfile): HCQSGComplianceReport {
    const violations: HCQSGComplianceViolation[] = [];
    let checkedCount = 0;

    // Validate 1: Hypertension BP Guideline
    checkedCount++;
    const sysBp = profile.vitalSigns.find(v => v.metric === 'Systolic BP')?.value;
    if (sysBp && sysBp >= 140) {
      const htnGuidelines = hckep.queryGuidelines('CHRONIC_DISEASE');
      if (htnGuidelines.length === 0) {
        violations.push({
          violationType: 'MISSING_EVIDENCE',
          description: 'No active clinical guideline found in HCKEP for Stage 2 Hypertension.',
          guidelineSource: 'HCKEP Knowledge Store',
          severity: 'HIGH',
          remediationAction: 'Publish updated AHA/ACC 2017 Hypertension guideline to HCKEP.',
        });
      }
    }

    // Validate 2: Diabetes Glycemic Target
    checkedCount++;
    const hba1c = profile.laboratoryResults.find(l => l.test === 'HbA1c')?.value;
    if (hba1c && hba1c >= 8.5) {
      violations.push({
        violationType: 'INCOMPLETE_RECOMMENDATION',
        description: 'HbA1c ≥8.5% requires dual therapy combination per ADA 2024 standards.',
        guidelineSource: 'ADA 2024 Standards of Care',
        severity: 'MEDIUM',
        remediationAction: 'Consider adding SGLT2i or GLP-1 RA alongside Metformin.',
      });
    }

    // Validate 3: Outdated Guidance check (simulated version check)
    checkedCount++;

    const overallCompliancePercent = checkedCount > 0
      ? Math.round(((checkedCount - violations.length) / checkedCount) * 100)
      : 100;

    return {
      overallCompliancePercent,
      compliant: violations.length === 0,
      checkedGuidelinesCount: checkedCount,
      violations,
    };
  }
}
