import { UnifiedRiskAssessment } from '@healthsense/clinical-intelligence';
import { GuidelineCitationService } from '../services/GuidelineCitationService';
import { GuidelineCitation } from '../interfaces/Evidence';

export class EvidenceEngine {
  public getEvidence(assessment: UnifiedRiskAssessment): GuidelineCitation[] {
    return GuidelineCitationService.extractCitations(assessment);
  }
}
