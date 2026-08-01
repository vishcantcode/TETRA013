// ============================================================================
// HEAGCP – Enterprise Administration, Governance & Configuration Platform
// Shared Types & Interfaces
// ============================================================================

import { MultidisciplinaryRole } from '@healthsense/hcccp';

export interface TenantOrganization {
  orgId: string;
  name: string; // e.g. "MetroHealth Hospital System"
  type: 'HOSPITAL_NETWORK' | 'COMMUNITY_HEALTH' | 'SPECIALTY_CLINIC';
  facilitiesCount: number;
  activeUsersCount: number;
  primaryBranding: { primaryColor: string; logoUrl: string };
  createdAt: Date;
}

export type UserLifecycleStatus = 'ACTIVE' | 'PENDING_PROVISIONING' | 'DEACTIVATED' | 'SUSPENDED';

export interface ManagedUser {
  userId: string;
  email: string;
  fullName: string;
  role: MultidisciplinaryRole;
  orgId: string;
  status: UserLifecycleStatus;
  delegatedAdmin: boolean;
  provisionedAt: Date;
}

export interface EnterpriseRolePolicy {
  roleId: string;
  roleName: string;
  baseRole: MultidisciplinaryRole;
  allowedCapabilities: string[];
  abacRules: { attribute: string; operator: 'EQUALS' | 'IN' | 'GREATER_THAN'; value: string }[];
  emergencyOverrideAllowed: boolean;
}

export interface FeatureFlags {
  enableAICopilot: boolean;
  enableSMARTLaunch: boolean;
  enablePredictiveSimulations: boolean;
  enableCaregiverPortal: boolean;
  enableHL7Messaging: boolean;
}

export interface PlatformConfiguration {
  configId: string;
  orgId: string;
  version: number;
  featureFlags: FeatureFlags;
  sessionTimeoutMin: number;
  mfaRequired: boolean;
  activeLanguage: 'en' | 'es' | 'fr';
  updatedAt: Date;
}

export interface GovernancePolicyRecord {
  policyId: string;
  title: string;
  category: 'AI_SAFETY' | 'CLINICAL_COMPLIANCE' | 'DATA_PRIVACY';
  version: string;
  approvedBy: string;
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'ARCHIVED';
  effectiveDate: Date;
}

export interface ConnectorAdminStatus {
  connectorId: string;
  name: string;
  type: 'FHIR' | 'HL7' | 'SMART' | 'DATABASE';
  endpointUrl: string;
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'UNREACHABLE';
  lastSyncAt: Date;
}

export interface OperationalSystemHealth {
  systemStatus: 'ALL_SYSTEMS_OPERATIONAL' | 'DEGRADED_PERFORMANCE' | 'MAINTENANCE';
  activeBackgroundJobs: number;
  telemetryQueueDepth: number;
  uptimeSeconds: number;
  lastBackupAt: Date;
}

export type EnvironmentProfile = 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT';

export interface PlatformLifecycleVersion {
  versionId: string;
  releaseTag: string; // e.g. "v5.24.0"
  environment: EnvironmentProfile;
  migrationStatus: 'COMPLETED' | 'PENDING' | 'ROLLED_BACK';
  deployedAt: Date;
  readinessScorePercent: number;
}
