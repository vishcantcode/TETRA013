// ============================================================================
// HCCCP – Platform Orchestrator
//
// Single entry point orchestrating Multidisciplinary Care Team Workspace,
// Secure Clinical Communication, Task Coordination, Clinical Handoff Framework,
// Shared Decision Support, Caregiver Participation, Real-Time Collaboration,
// and HOIP telemetry.
// ============================================================================

import {
  MultidisciplinaryWorkspaceView,
  ClinicalThread,
  CoordinatedTask,
  StructuredHandoff,
  ConsensusDecision,
  RealTimePresenceStatus,
  MultidisciplinaryRole,
} from './types';
import { HCCCPCareTeamWorkspaceEngine } from './care-team-workspace';
import { HCCCPClinicalCommunicationPlatform } from './clinical-communication';
import { HCCCPTaskCoordinationEngine } from './task-coordination';
import { HCCCPClinicalHandoffFramework } from './handoff-framework';
import { HCCCPSharedDecisionSupportInterface } from './shared-decision';
import { HCCCPCaregiverParticipationModule } from './caregiver-participation';
import { HCCCPRealTimeCollaborationServices } from './realtime-collaboration';

export class HCCCPPlatform {
  private workspaceEngine = new HCCCPCareTeamWorkspaceEngine();
  private communicationPlatform = new HCCCPClinicalCommunicationPlatform();
  private taskEngine = new HCCCPTaskCoordinationEngine();
  private handoffFramework = new HCCCPClinicalHandoffFramework();
  private sharedDecisionInterface = new HCCCPSharedDecisionSupportInterface();
  private caregiverModule = new HCCCPCaregiverParticipationModule();
  private realtimeServices = new HCCCPRealTimeCollaborationServices();

  // Internal telemetry
  private telemetry = {
    totalWorkspacesRendered: 0,
    totalMessagesPosted: 0,
    totalTasksCoordinated: 0,
    totalHandoffsCompleted: 0,
    totalConsensusDecisions: 0,
    totalLatencyMs: 0,
  };

  /**
   * Execute full collaborative care workflow session for a patient.
   */
  public executeCollaborativeSession(
    patientId: string,
    practitionerId: string,
    role: MultidisciplinaryRole = 'PHYSICIAN'
  ): {
    workspaceView: MultidisciplinaryWorkspaceView;
    activeThread: ClinicalThread;
    taskCreated: CoordinatedTask;
    handoffInitiated: StructuredHandoff;
    consensusDecision: ConsensusDecision;
    presenceStatus: RealTimePresenceStatus;
    telemetryPublished: boolean;
    latencyMs: number;
  } {
    const start = performance.now();

    // 1. Build Multidisciplinary Care Team Workspace
    const workspaceView = this.workspaceEngine.buildCareTeamWorkspaceView(patientId);

    // 2. Update Live Presence
    const presenceStatus = this.realtimeServices.updatePresence(
      practitionerId,
      'Dr. Sarah Jenkins',
      role,
      'ONLINE',
      patientId
    );

    // 3. Create or Get Clinical Communication Thread
    let activeThread = this.communicationPlatform.getThreadsForPatient(patientId)[0];
    if (!activeThread) {
      activeThread = this.communicationPlatform.createThread(patientId, 'Multidisciplinary Care Discussion', 'Observation/obs-bnp');
      this.communicationPlatform.postMessage(
        activeThread.threadId,
        practitionerId,
        role,
        'Reviewed BNP results (450 pg/mL). @nurse-emily Please administer morning IV furosemide.',
        [{ targetResource: 'Observation/obs-bnp', annotationText: 'Critical elevation requiring IV diuretic therapy.' }]
      );
    }

    // 4. Create Coordinated Care Task
    const taskCreated = this.taskEngine.createCoordinatedTask(
      patientId,
      'Administer IV Furosemide 40mg',
      'Administer IV Furosemide and monitor hourly urine output.',
      'nurse-emily',
      'NURSE',
      'HIGH'
    );

    // 5. Initiate Clinical Handoff
    const handoffInitiated = this.handoffFramework.initiateHandoff(
      patientId,
      'SHIFT',
      practitionerId,
      'dr-jones-night',
      ['Monitor BNP levels', 'Check IV Furosemide output at 22:00']
    );

    // 6. Shared Decision Support Consensus Thread
    const consensusDecision = this.sharedDecisionInterface.initiateConsensusDecision(
      patientId,
      'Initiate Quadruple Therapy for HFrEF (ARNI + SGLT2i)',
      'ACDSS'
    );
    this.sharedDecisionInterface.recordVote(
      consensusDecision.decisionId,
      practitionerId,
      role,
      'APPROVE',
      'Clinical evidence from ACDSS and patient digital twin supports early ARNI initiation.'
    );

    const latencyMs = parseFloat((performance.now() - start).toFixed(3));

    // 7. Update Telemetry
    this.updateTelemetry(1, activeThread.messages.length, 1, 1, 1, latencyMs);

    return {
      workspaceView,
      activeThread,
      taskCreated,
      handoffInitiated,
      consensusDecision,
      presenceStatus,
      telemetryPublished: true,
      latencyMs,
    };
  }

  public getWorkspaceEngine(): HCCCPCareTeamWorkspaceEngine {
    return this.workspaceEngine;
  }

  public getCommunicationPlatform(): HCCCPClinicalCommunicationPlatform {
    return this.communicationPlatform;
  }

  public getTaskEngine(): HCCCPTaskCoordinationEngine {
    return this.taskEngine;
  }

  public getHandoffFramework(): HCCCPClinicalHandoffFramework {
    return this.handoffFramework;
  }

  public getSharedDecisionInterface(): HCCCPSharedDecisionSupportInterface {
    return this.sharedDecisionInterface;
  }

  public getCaregiverModule(): HCCCPCaregiverParticipationModule {
    return this.caregiverModule;
  }

  public getRealtimeServices(): HCCCPRealTimeCollaborationServices {
    return this.realtimeServices;
  }

  private updateTelemetry(
    workspaces: number,
    msgs: number,
    tasks: number,
    handoffs: number,
    decisions: number,
    latency: number
  ): void {
    this.telemetry.totalWorkspacesRendered += workspaces;
    this.telemetry.totalMessagesPosted += msgs;
    this.telemetry.totalTasksCoordinated += tasks;
    this.telemetry.totalHandoffsCompleted += handoffs;
    this.telemetry.totalConsensusDecisions += decisions;
    this.telemetry.totalLatencyMs += latency;
  }

  public getTelemetry() {
    return {
      ...this.telemetry,
      averageLatencyMs:
        this.telemetry.totalWorkspacesRendered > 0
          ? parseFloat((this.telemetry.totalLatencyMs / this.telemetry.totalWorkspacesRendered).toFixed(3))
          : 0,
    };
  }
}

export const hcccp = new HCCCPPlatform();
