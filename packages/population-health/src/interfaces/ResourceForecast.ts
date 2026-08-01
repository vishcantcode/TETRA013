export interface ResourceForecast {
  estimatedSpecialistVisitsNeeded: { specialty: string; requiredVisitsPerMonth: number }[];
  labKitDemand: { testName: string; requiredKitsNext30Days: number }[];
  screeningCampPriorities: { villageName: string; priorityScore: number; recommendedFocus: string }[];
}
