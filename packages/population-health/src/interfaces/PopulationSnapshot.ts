import { RegionSummary } from './DistrictMetrics';
import { DiseasePrevalence, RiskTierProportions, MultimorbidityOverlap } from './DiseaseDistribution';
import { RegionalScreeningGaps } from './ScreeningGap';
import { ReferralMetrics } from './ReferralMetrics';
import { TrendReport } from './TrendReport';
import { ResourceForecast } from './ResourceForecast';

export interface PopulationSnapshot {
  snapshotId: string;
  generatedAt: string;
  isAnonymized: true;
  totalPopulationEvaluated: number;
  region: RegionSummary;
  diseasePrevalence: DiseasePrevalence[];
  riskDistribution: RiskTierProportions;
  multimorbidity: MultimorbidityOverlap;
  screeningGaps: RegionalScreeningGaps;
  referralMetrics: ReferralMetrics;
  trends: TrendReport;
  resourceForecast: ResourceForecast;
}
