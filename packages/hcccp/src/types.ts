// ============================================================================
// HCCCP – Collaborative Care & Coordination Platform
// Shared Multidisciplinary Collaboration Types
// ============================================================================

import { ClinicianRole } from '@healthsense/hucwp';

export type MultidisciplinaryRole = ClinicianRole | 'THERAPIST' | 'CAREGIVER';

export interface CareTeamMember {
  memberId: string;
  name: string;
  role: MultidisciplinaryRole;
  specialty?: string;
  assignedTasksCount: number;
}

export interface MultidisciplinaryWorkspaceView {
  patientId: string;
  patientName: string;
  careTeam: CareTeamMember[];
  assignedResponsibilities: { role: MultidisciplinaryRole; responsibility: string }[];
  activeTasks: { taskId: string; title: string; assignee: string; priority: string; dueDate: Date }[];
  careMilestones: { milestoneId: string; title: string; completed: boolean }[];
  pendingActionsCount: number;
}

export interface ClinicalThreadMessage {
  messageId: string;
  threadId: string;
  authorId: string;
  authorRole: MultidisciplinaryRole;
  content: string;
  mentions: string[];
  clinicalAnnotations?: { targetResource: string; annotationText: string }[];
  sentAt: Date;
}

export interface ClinicalThread {
  threadId: string;
  patientId: string;
  topic: string;
  contextResource?: string; // e.g. "Observation/obs-101"
  messages: ClinicalThreadMessage[];
  createdAt: Date;
}

export interface CoordinatedTask {
  taskId: string;
  patientId: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeRole: MultidisciplinaryRole;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'ROUTINE';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ESCALATED';
  dependsOnTaskId?: string;
  dueDate: Date;
  escalatedTo?: string;
}

export type HandoffType = 'SHIFT' | 'DEPARTMENT_TRANSFER' | 'DISCHARGE' | 'REFERRAL';

export interface StructuredHandoff {
  handoffId: string;
  patientId: string;
  type: HandoffType;
  outgoingPractitionerId: string;
  incomingPractitionerId: string;
  aiGeneratedSummary: string;
  criticalWatchItems: string[];
  acknowledgedByIncoming: boolean;
  acknowledgedAt?: Date;
  transferredAt: Date;
}

export type DecisionVote = 'APPROVE' | 'REJECT' | 'ABSTAIN';

export interface ConsensusDecision {
  decisionId: string;
  patientId: string;
  recommendationTitle: string;
  sourceEngine: 'ACDSS' | 'HPPM' | 'HCSOF';
  consensusStatus: 'CONSENSUS_REACHED' | 'DISAGREEMENT' | 'PENDING_VOTES';
  votes: { practitionerId: string; role: MultidisciplinaryRole; vote: DecisionVote; rationale: string }[];
  finalRecordedRationale?: string;
  createdAt: Date;
}

export interface CaregiverDelegation {
  delegationId: string;
  patientId: string;
  caregiverName: string;
  caregiverRelationship: string;
  permissions: ('APPOINTMENT_VIEW' | 'MEDICATION_REMINDERS' | 'EDUCATIONAL_ACCESS' | 'DIRECT_MESSAGING')[];
  active: boolean;
}

export type ClinicianPresence = 'ONLINE' | 'IN_PATIENT_ROOM' | 'IN_SURGERY' | 'OFFLINE';

export interface RealTimePresenceStatus {
  practitionerId: string;
  name: string;
  role: MultidisciplinaryRole;
  presence: ClinicianPresence;
  currentActivePatientId?: string;
  lastActiveAt: Date;
}
