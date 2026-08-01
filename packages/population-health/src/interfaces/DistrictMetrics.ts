export interface DemographicsBreakdown {
  ageGroups: { group: '< 40' | '40-54' | '55-69' | '70+'; count: number; percentage: number }[];
  genderBreakdown: { malePercentage: number; femalePercentage: number; otherPercentage: number };
}

export interface RegionSummary {
  regionId: string;
  regionName: string;
  regionType: 'District' | 'PHC' | 'CHC' | 'Village';
  totalPopulationScreened: number;
  highRiskCount: number;
  severeRiskCount: number;
  demographics: DemographicsBreakdown;
}
