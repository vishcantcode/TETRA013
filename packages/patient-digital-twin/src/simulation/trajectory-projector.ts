import { TwinState } from '../domain';
import { ConstraintEngine } from './constraint-engine';

export class TrajectoryProjector {
  /**
   * Projects a forward trajectory array of TwinState snapshots over K steps.
   */
  public static projectTrajectory(
    currentState: TwinState,
    steps: number,
    stepIntervalMs: number = 3600000
  ): TwinState[] {
    const trajectory: TwinState[] = [];
    let state = JSON.parse(JSON.stringify(currentState)) as TwinState;

    for (let k = 0; k < steps; k++) {
      state = this.stepForward(state, stepIntervalMs);
      trajectory.push(JSON.parse(JSON.stringify(state)));
    }

    return trajectory;
  }

  /**
   * Advances state forward by stepIntervalMs using first-order Euler integration.
   */
  private static stepForward(state: TwinState, stepIntervalMs: number): TwinState {
    const nextState: TwinState = JSON.parse(JSON.stringify(state));
    nextState.version += 1;

    const currentEpoch = new Date(state.lastTimestamp).getTime();
    nextState.lastTimestamp = new Date(currentEpoch + stepIntervalMs).toISOString();

    // Euler integration update for vital sign trajectories toward baseline
    for (const v of Object.values(nextState.vitals)) {
      if (v.metric === 'heartRate' && v.value > 72) {
        v.value -= 0.5; // Natural homeostatic restoration
      }
    }

    return ConstraintEngine.enforceSafetyBounds(nextState);
  }
}
