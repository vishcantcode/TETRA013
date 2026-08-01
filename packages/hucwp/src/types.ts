// ============================================================================
// HUCWP – Unified Clinical Workspace Platform
// Shared Types & Interfaces
// ============================================================================

import { ACDSSEvaluationResult } from '@healthsense/acdss';
import { HPPHIEvaluationResult as HPPHIPatientEvaluationResult } from '@healthsense/hpphi';
import { HPPMEvaluationResult } from '@healthsense/hppm';
import { HCSOFEvaluationResult } from '@healthsense/hcsof';
import { HECITEvaluationResult } from '@healthsense/hecit';
import { HCQSGEvaluationResult } from '@healthsense/hcqsg';

export type ClinicianRole =
  | 'PHYSICIAN'
  | 'NURSE'
  | 'SPECIALIST'
  | 'PHARMACIST'
  | 'CARE_COORDINATOR'
  | 'ADMINISTRATOR';

export type WorkspaceTheme = 'DARK' | 'LIGHT' | 'HIGH_CONTRAST';

export interface PatientCommandCenterView {
  patientId: string;
  demographics: { name: string; age: number; gender: string; mrn: string };
  longitudinalTimeline: { date: Date; eventType: string; summary: string }[];
  currentEncounter?: { encounterId: string; type: string; location: string; admittedAt: Date };
  clinicalAlerts: { alertId: string; severity: 'HIGH' | 'MEDIUM' | 'LOW'; title: string; message: string }[];
  activeMedications: string[];
  laboratorySummaries: { test: string; value: number; unit: string; referenceRange: string; flagged: boolean }[];
  imagingSummaries: { studyName: string; date: Date; status: string; keyFindings: string }[];
  acdssRecommendations?: ACDSSEvaluationResult;
  simulationResults?: HCSOFEvaluationResult;
  preventiveInsights?: HPPHIPatientEvaluationResult;
  precisionCarePlan?: HPPMEvaluationResult;
  explainabilityPanel?: HECITEvaluationResult;
  governanceIndicators?: HCQSGEvaluationResult;
}

export interface CopilotQuery {
  patientId?: string;
  userRole: ClinicianRole;
  queryText: string;
  contextParams?: Record<string, any>;
}

export interface CopilotResponse {
  queryText: string;
  responseText: string;
  suggestedActions: string[];
  evidenceCitations: { title: string; source: string; confidence: number }[];
  latencyMs: number;
}

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'ROUTINE';

export interface ClinicianTask {
  taskId: string;
  patientId: string;
  assignedRole: ClinicianRole;
  assigneeId?: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate: Date;
}

export interface CareTeamNote {
  noteId: string;
  patientId: string;
  authorId: string;
  authorRole: ClinicianRole;
  content: string;
  mentions: string[]; // e.g. ["@dr-smith", "@pharmacy"]
  createdAt: Date;
}

export interface ClinicalHandoff {
  handoffId: string;
  patientId: string;
  outgoingPractitionerId: string;
  incomingPractitionerId: string;
  summary: string;
  criticalWatchItems: string[];
  transferredAt: Date;
}

export interface DashboardWidget {
  widgetId: string;
  title: string;
  type: 'METRIC_CARD' | 'PATIENT_QUEUE' | 'ALERT_LIST' | 'KPI_CHART';
  data: any;
}

export interface DashboardLayout {
  layoutId: string;
  role: ClinicianRole;
  widgets: DashboardWidget[];
}

export interface QuickAction {
  actionId: string;
  label: string;
  shortcut: string; // e.g. "Ctrl+Shift+D"
  category: string;
}
