export type TrendDirection = 'improving' | 'stable' | 'deteriorating' | 'rapid_deterioration' | 'recovery' | 'persistent_non_adherence';

export interface RiskFactor {
  id: string;
  category: 'lifestyle' | 'clinical' | 'behavioral' | 'demographic';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
}

export interface RiskTrend {
  metric: string;
  direction: TrendDirection;
  historicalContext: string;
  velocity: number;
}

export interface RiskScore {
  overallRisk: number; // 0 to 100
  cardiovascularRisk?: number;
  metabolicRisk?: number;
}

export interface RiskAssessment {
  score: RiskScore;
  factors: RiskFactor[];
  trends: RiskTrend[];
  generatedAt: Date;
}

export interface HealthOpportunity {
  id: string;
  type: 'screening' | 'lifestyle' | 'reassessment' | 'reinforcement';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  potentialBenefit: string;
}

export interface PreventiveRecommendation {
  id: string;
  action: string;
  confidence: number;
  evidence: string[];
  explanation: {
    patient: string;
    clinician: string;
  };
}

export interface PreventiveInsight {
  id: string;
  category: string;
  insight: string;
}

export interface PreventiveAssessment {
  patientId: string;
  assessmentDate: Date;
  risk: RiskAssessment;
  opportunities: HealthOpportunity[];
  recommendations: PreventiveRecommendation[];
  insights: PreventiveInsight[];
}
