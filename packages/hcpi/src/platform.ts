import { HCPIProfileManager, HCPIPatientProfile } from './profile';
import { HCPITrendRiskEngine, HCPIRiskEvolution } from './trends';
import { HCPIPredictiveModule, HCPIPredictiveInsights } from './predictive';

export interface HCPIAnalysisResult {
  profile: HCPIPatientProfile;
  riskEvolution: HCPIRiskEvolution;
  predictiveInsights: HCPIPredictiveInsights;
  timestamp: Date;
}

export class HCPIPlatform {
  private profileManager: HCPIProfileManager;
  private trendEngine: HCPITrendRiskEngine;
  private predictiveModule: HCPIPredictiveModule;

  constructor() {
    this.profileManager = new HCPIProfileManager();
    this.trendEngine = new HCPITrendRiskEngine();
    this.predictiveModule = new HCPIPredictiveModule();
  }

  public analyzePatientLongitudinal(patientId: string, delta?: Partial<HCPIPatientProfile>): HCPIAnalysisResult {
    // 1. Get or Update Profile
    let profile: HCPIPatientProfile;
    if (delta) {
      profile = this.profileManager.updateProfile(patientId, delta);
    } else {
      profile = this.profileManager.getOrCreateProfile(patientId);
    }

    // 2. Evaluate Trends & Risk Evolution
    const riskEvolution = this.trendEngine.evaluateRiskEvolution(profile);

    // 3. Generate Predictive Insights based on Profile & Risk Evolution
    const predictiveInsights = this.predictiveModule.generatePredictiveInsights(profile, riskEvolution);

    return {
      profile,
      riskEvolution,
      predictiveInsights,
      timestamp: new Date()
    };
  }

  public getProfileManager(): HCPIProfileManager {
    return this.profileManager;
  }
}

export const hcpi = new HCPIPlatform();
