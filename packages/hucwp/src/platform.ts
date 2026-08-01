// ============================================================================
// HUCWP – Platform Orchestrator
//
// Single entry point orchestrating Unified Patient Command Center, AI Copilot,
// Adaptive Workflow Engine, Care Team Collaboration, Smart Dashboards,
// Contextual Decision Support, Productivity Tools, Enterprise UX, and HOIP telemetry.
// ============================================================================

import {
  ClinicianRole,
  PatientCommandCenterView,
  CopilotResponse,
  DashboardLayout,
  CareTeamNote,
} from './types';
import { HUCWPCommandCenterEngine } from './command-center';
import { HUCWPAICopilotEngine } from './ai-copilot';
import { HUCWPAdaptiveWorkflowEngine } from './adaptive-workflow';
import { HUCWPCareTeamCollaborationPlatform } from './collaboration';
import { HUCWPSmartDashboardFramework } from './smart-dashboards';
import { HUCWPContextualCDSEngine } from './contextual-cds';
import { HUCWPProductivityEngine } from './productivity';
import { HUCWPEnterpriseUXEngine } from './enterprise-ux';

export class HUCWPPlatform {
  private commandCenterEngine = new HUCWPCommandCenterEngine();
  private copilotEngine = new HUCWPAICopilotEngine();
  private workflowEngine = new HUCWPAdaptiveWorkflowEngine();
  private collaborationPlatform = new HUCWPCareTeamCollaborationPlatform();
  private dashboardFramework = new HUCWPSmartDashboardFramework();
  private contextualCDSEngine = new HUCWPContextualCDSEngine();
  private productivityEngine = new HUCWPProductivityEngine();
  private uxEngine = new HUCWPEnterpriseUXEngine();

  // Internal telemetry
  private telemetry = {
    totalCommandCenterViews: 0,
    totalCopilotQueries: 0,
    totalTasksExecuted: 0,
    totalCollaborationsLogged: 0,
    totalDashboardsRendered: 0,
    totalLatencyMs: 0,
  };

  /**
   * Render complete Unified Clinical Workspace session for a healthcare professional.
   */
  public renderUnifiedWorkspace(
    patientId: string,
    role: ClinicianRole = 'PHYSICIAN',
    queryText = 'What are the top differential diagnoses for dyspnea and elevated BNP?'
  ): {
    commandCenterView: PatientCommandCenterView;
    copilotResponse: CopilotResponse;
    roleTasks: ReturnType<HUCWPAdaptiveWorkflowEngine['getTasksForRole']>;
    dashboardLayout: DashboardLayout;
    contextualCDS: ReturnType<HUCWPContextualCDSEngine['evaluateContextualRecommendations']>;
    uxConfig: ReturnType<HUCWPEnterpriseUXEngine['getUXConfiguration']>;
    noteAdded: CareTeamNote;
    telemetryPublished: boolean;
    latencyMs: number;
  } {
    const start = performance.now();

    // 1. Build Command Center View
    const commandCenterView = this.commandCenterEngine.buildPatientCommandCenterView(patientId, role);

    // 2. Query AI Clinical Copilot
    const copilotResponse = this.copilotEngine.queryCopilot({ patientId, userRole: role, queryText });

    // 3. Adaptive Role Tasks
    const roleTasks = this.workflowEngine.getTasksForRole(role);

    // 4. Smart Dashboard Layout
    const dashboardLayout = this.dashboardFramework.generateDashboard(role);

    // 5. Contextual Decision Support
    const contextualCDS = this.contextualCDSEngine.evaluateContextualRecommendations(patientId, role);

    // 6. Care Team Collaboration Note
    const noteAdded = this.collaborationPlatform.addNote(
      patientId,
      'prac-physician-01',
      role,
      `Reviewed command center view. @dr-smith @pharmacy Initiating SGLT2i evaluation.`
    );

    // 7. UX Configuration
    const uxConfig = this.uxEngine.getUXConfiguration();

    const latencyMs = parseFloat((performance.now() - start).toFixed(3));

    // 8. Update Telemetry
    this.updateTelemetry(1, 1, roleTasks.length, 1, 1, latencyMs);

    return {
      commandCenterView,
      copilotResponse,
      roleTasks,
      dashboardLayout,
      contextualCDS,
      uxConfig,
      noteAdded,
      telemetryPublished: true,
      latencyMs,
    };
  }

  public getCommandCenterEngine(): HUCWPCommandCenterEngine {
    return this.commandCenterEngine;
  }

  public getCopilotEngine(): HUCWPAICopilotEngine {
    return this.copilotEngine;
  }

  public getWorkflowEngine(): HUCWPAdaptiveWorkflowEngine {
    return this.workflowEngine;
  }

  public getCollaborationPlatform(): HUCWPCareTeamCollaborationPlatform {
    return this.collaborationPlatform;
  }

  public getDashboardFramework(): HUCWPSmartDashboardFramework {
    return this.dashboardFramework;
  }

  public getProductivityEngine(): HUCWPProductivityEngine {
    return this.productivityEngine;
  }

  public getUXEngine(): HUCWPEnterpriseUXEngine {
    return this.uxEngine;
  }

  private updateTelemetry(
    cmd: number,
    copilot: number,
    tasks: number,
    collab: number,
    dash: number,
    latency: number
  ): void {
    this.telemetry.totalCommandCenterViews += cmd;
    this.telemetry.totalCopilotQueries += copilot;
    this.telemetry.totalTasksExecuted += tasks;
    this.telemetry.totalCollaborationsLogged += collab;
    this.telemetry.totalDashboardsRendered += dash;
    this.telemetry.totalLatencyMs += latency;
  }

  public getTelemetry() {
    return {
      ...this.telemetry,
      averageLatencyMs:
        this.telemetry.totalCommandCenterViews > 0
          ? parseFloat((this.telemetry.totalLatencyMs / this.telemetry.totalCommandCenterViews).toFixed(3))
          : 0,
    };
  }
}

export const hucwp = new HUCWPPlatform();
