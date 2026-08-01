// ============================================================================
// HEAGCP – Platform Orchestrator
//
// Single entry point orchestrating Organization Management, User & Access Admin,
// Role & Policy Management, Configuration Center, Governance Center, Integration Console,
// Operational Admin, Lifecycle Management, and HOIP telemetry.
// ============================================================================

import {
  TenantOrganization,
  ManagedUser,
  EnterpriseRolePolicy,
  PlatformConfiguration,
  GovernancePolicyRecord,
  ConnectorAdminStatus,
  OperationalSystemHealth,
  PlatformLifecycleVersion,
} from './types';
import { HEAGCPOrganizationManagementCenter } from './organization-management';
import { HEAGCPUserAccessAdministration } from './user-access-admin';
import { HEAGCPRolePolicyManagementEngine } from './role-policy-management';
import { HEAGCPPlatformConfigurationCenter } from './configuration-center';
import { HEAGCPEnterpriseGovernanceCenter } from './governance-center';
import { HEAGCPIntegrationConsole } from './integration-console';
import { HEAGCPOperationalAdminConsole } from './operational-admin';
import { HEAGCPPlatformLifecycleManagement } from './lifecycle-management';

export class HEAGCPPlatform {
  private orgCenter = new HEAGCPOrganizationManagementCenter();
  private userAdmin = new HEAGCPUserAccessAdministration();
  private rolePolicyEngine = new HEAGCPRolePolicyManagementEngine();
  private configCenter = new HEAGCPPlatformConfigurationCenter();
  private governanceCenter = new HEAGCPEnterpriseGovernanceCenter();
  private integrationConsole = new HEAGCPIntegrationConsole();
  private operationalConsole = new HEAGCPOperationalAdminConsole();
  private lifecycleManagement = new HEAGCPPlatformLifecycleManagement();

  // Internal telemetry
  private telemetry = {
    totalAdminSessions: 0,
    totalUsersProvisioned: 0,
    totalConfigUpdates: 0,
    totalConnectorsMonitored: 0,
    totalGovernanceChecks: 0,
    totalLatencyMs: 0,
  };

  /**
   * Render complete Enterprise Administration & Governance Session for an organization.
   */
  public renderAdminSession(orgId = 'org-metrohealth'): {
    organization: TenantOrganization;
    users: ManagedUser[];
    policies: EnterpriseRolePolicy[];
    configuration: PlatformConfiguration;
    governancePolicies: GovernancePolicyRecord[];
    connectors: ConnectorAdminStatus[];
    systemHealth: OperationalSystemHealth;
    activeVersion: PlatformLifecycleVersion;
    telemetryPublished: boolean;
    latencyMs: number;
  } {
    const start = performance.now();

    // 1. Get Organization Details
    const organization = this.orgCenter.getOrganization(orgId) || this.orgCenter.getOrganizations()[0];

    // 2. Get Users
    const users = this.userAdmin.getUsers(orgId);

    // 3. Get Role Policies
    const policies = this.rolePolicyEngine.getPolicies();

    // 4. Get Platform Configuration
    const configuration = this.configCenter.getConfiguration(orgId);

    // 5. Get Governance Policies
    const governancePolicies = this.governanceCenter.getGovernancePolicies();

    // 6. Get Connector Statuses
    const connectors = this.integrationConsole.getConnectorStatuses();

    // 7. Get Operational System Health
    const systemHealth = this.operationalConsole.getOperationalHealth();

    // 8. Get Active Lifecycle Version
    const activeVersion = this.lifecycleManagement.getActiveVersion('PRODUCTION') || this.lifecycleManagement.getVersions()[0];

    const latencyMs = parseFloat((performance.now() - start).toFixed(3));

    // 9. Update Telemetry
    this.updateTelemetry(1, users.length, 1, connectors.length, governancePolicies.length, latencyMs);

    return {
      organization,
      users,
      policies,
      configuration,
      governancePolicies,
      connectors,
      systemHealth,
      activeVersion,
      telemetryPublished: true,
      latencyMs,
    };
  }

  public getOrgCenter(): HEAGCPOrganizationManagementCenter {
    return this.orgCenter;
  }

  public getUserAdmin(): HEAGCPUserAccessAdministration {
    return this.userAdmin;
  }

  public getRolePolicyEngine(): HEAGCPRolePolicyManagementEngine {
    return this.rolePolicyEngine;
  }

  public getConfigCenter(): HEAGCPPlatformConfigurationCenter {
    return this.configCenter;
  }

  public getGovernanceCenter(): HEAGCPEnterpriseGovernanceCenter {
    return this.governanceCenter;
  }

  public getIntegrationConsole(): HEAGCPIntegrationConsole {
    return this.integrationConsole;
  }

  public getOperationalConsole(): HEAGCPOperationalAdminConsole {
    return this.operationalConsole;
  }

  public getLifecycleManagement(): HEAGCPPlatformLifecycleManagement {
    return this.lifecycleManagement;
  }

  private updateTelemetry(
    sessions: number,
    usersCount: number,
    configUpdates: number,
    connectorsCount: number,
    govChecks: number,
    latency: number
  ): void {
    this.telemetry.totalAdminSessions += sessions;
    this.telemetry.totalUsersProvisioned += usersCount;
    this.telemetry.totalConfigUpdates += configUpdates;
    this.telemetry.totalConnectorsMonitored += connectorsCount;
    this.telemetry.totalGovernanceChecks += govChecks;
    this.telemetry.totalLatencyMs += latency;
  }

  public getTelemetry() {
    return {
      ...this.telemetry,
      averageLatencyMs:
        this.telemetry.totalAdminSessions > 0
          ? parseFloat((this.telemetry.totalLatencyMs / this.telemetry.totalAdminSessions).toFixed(3))
          : 0,
    };
  }
}

export const heagcp = new HEAGCPPlatform();
