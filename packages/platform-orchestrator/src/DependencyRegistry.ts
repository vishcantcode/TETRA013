import { ClinicalEngine } from '@healthsense/clinical-intelligence';
import { ExplainabilityEngine } from '@healthsense/clinical-explainability';
import { ReferralEngine } from '@healthsense/clinical-referrals';
import { EducationEngine } from '@healthsense/patient-engagement';
import { DocumentIntelligenceEngine } from '@healthsense/medical-document-intelligence';
import { DigitalTwinEngine } from '@healthsense/patient-digital-twin';
import { PopulationAnalyticsEngine } from '@healthsense/population-health';

export class DependencyRegistry {
  private static instance: DependencyRegistry;

  public readonly clinicalEngine: ClinicalEngine;
  public readonly explainabilityEngine: ExplainabilityEngine;
  public readonly referralEngine: ReferralEngine;
  public readonly educationEngine: EducationEngine;
  public readonly documentEngine: DocumentIntelligenceEngine;
  public readonly digitalTwinEngine: DigitalTwinEngine;
  public readonly populationEngine: PopulationAnalyticsEngine;

  private constructor() {
    this.clinicalEngine = new ClinicalEngine();
    this.explainabilityEngine = new ExplainabilityEngine();
    this.referralEngine = new ReferralEngine();
    this.educationEngine = new EducationEngine();
    this.documentEngine = new DocumentIntelligenceEngine();
    this.digitalTwinEngine = new DigitalTwinEngine();
    this.populationEngine = new PopulationAnalyticsEngine();
  }

  public static getInstance(): DependencyRegistry {
    if (!DependencyRegistry.instance) {
      DependencyRegistry.instance = new DependencyRegistry();
    }
    return DependencyRegistry.instance;
  }
}
