export interface MonthlyTrendPoint {
  month: string;
  screeningsCount: number;
  highRiskCount: number;
  referralsCount: number;
}

export interface TrendReport {
  lastMonthPrevalenceChangePercentage: number;
  lastQuarterScreeningImprovementPercentage: number;
  monthlyTrends: MonthlyTrendPoint[];
}
