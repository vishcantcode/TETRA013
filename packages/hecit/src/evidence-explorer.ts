// ============================================================================
// HECIT – Capability 2: Evidence Explorer Module
// ============================================================================

import { HECITEvidenceExploration, HECITEvidenceItem } from './types';
import { hckep } from '@healthsense/hckep';

export class HECITEvidenceExplorerEngine {

  public explore(recommendationTopic: string): HECITEvidenceExploration {
    // Leverage HCKEP clinical knowledge platform
    const guidelines = hckep.queryGuidelines('CHRONIC_DISEASE');
    const primaryGuideline = guidelines[0]?.title || 'USPSTF / AHA / ADA Guidelines';

    const supportingEvidence: HECITEvidenceItem[] = [
      {
        evidenceId: 'ev-sup-01',
        title: 'ACC/AHA 2017 High Blood Pressure Clinical Practice Guideline',
        source: 'AHA/ACC (JACC 2018)',
        type: 'SUPPORTING',
        evidenceStrength: 'HIGH',
        evidenceQuality: 'META_ANALYSIS',
        summary: 'Target BP <130/80 mmHg reduces major adverse cardiovascular events (MACE) by 25% and stroke by 30% in high-risk patients.',
      },
      {
        evidenceId: 'ev-sup-02',
        title: 'ADA 2024 Standards of Care in Diabetes',
        source: 'American Diabetes Association (Diabetes Care 2024)',
        type: 'SUPPORTING',
        evidenceStrength: 'HIGH',
        evidenceQuality: 'RCT',
        summary: 'First-line therapy with Metformin and early addition of SGLT2i or GLP-1 RA provides glycemic control and cardio-renal protection.',
      },
      {
        evidenceId: 'ev-sup-03',
        title: 'DASH Collaborative Clinical Trial',
        source: 'NEJM 1997 / SPRINT Trial NEJM 2015',
        type: 'SUPPORTING',
        evidenceStrength: 'HIGH',
        evidenceQuality: 'RCT',
        summary: 'DASH diet reduces systolic BP by 8-14 mmHg; intensive BP control (<120 mmHg) reduces all-cause mortality.',
      },
    ];

    const contradictingEvidence: HECITEvidenceItem[] = [
      {
        evidenceId: 'ev-con-01',
        title: 'ACCORD Trial Glycemic Control Arm',
        source: 'NEJM 2008',
        type: 'CONTRADICTING',
        evidenceStrength: 'MODERATE',
        evidenceQuality: 'RCT',
        summary: 'Intensive glycemic control (HbA1c <6.0%) in older, high-risk patients increased hypoglycemia episodes without mortality benefit.',
      },
    ];

    return {
      recommendationTopic,
      supportingEvidence,
      contradictingEvidence,
      overallStrength: 'HIGH',
      primaryGuidelineSource: primaryGuideline,
    };
  }
}
