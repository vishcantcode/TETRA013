// ============================================================================
// HPOIP – Capability 5: Resource & Capacity Planning
// ============================================================================

import { CapacityPlanningScenario } from './types';

export class HPOIPCapacityPlanningEngine {

  /**
   * Run operational what-if simulation scenarios for clinic capacity and staffing allocation.
   */
  public runCapacitySimulation(
    demandIncreasePercent: number,
    staffingAdjustmentFTE: number
  ): CapacityPlanningScenario {
    const baseWaitTime = 18.2;
    const baseBedOccupancy = 84.5;

    // Operational math simulation
    const waitTimeDelta = demandIncreasePercent * 0.8 - staffingAdjustmentFTE * 3.5;
    const simulatedWaitTimeMin = Math.max(5, parseFloat((baseWaitTime + waitTimeDelta).toFixed(1)));

    const occupancyDelta = demandIncreasePercent * 0.4 - staffingAdjustmentFTE * 1.2;
    const simulatedBedOccupancyPercent = Math.min(100, Math.max(50, parseFloat((baseBedOccupancy + occupancyDelta).toFixed(1))));

    const feasible = simulatedWaitTimeMin < 25 && simulatedBedOccupancyPercent < 92;

    return {
      scenarioId: `scen-cap-${demandIncreasePercent}d-${staffingAdjustmentFTE}fte`,
      name: `Scenario: +${demandIncreasePercent}% Demand with +${staffingAdjustmentFTE} FTE Staffing`,
      projectedDemandIncreasePercent: demandIncreasePercent,
      staffingAdjustmentFTE,
      simulatedWaitTimeMin,
      simulatedBedOccupancyPercent,
      feasible,
    };
  }
}
