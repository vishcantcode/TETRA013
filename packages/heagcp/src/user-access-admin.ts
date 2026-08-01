// ============================================================================
// HEAGCP – Capability 2: User & Access Administration
// ============================================================================

import crypto from 'node:crypto';
import { ManagedUser, UserLifecycleStatus } from './types';
import { MultidisciplinaryRole } from '@healthsense/hcccp';

export class HEAGCPUserAccessAdministration {
  private userStore: Map<string, ManagedUser> = new Map();

  constructor() {
    this.seedDefaultUsers();
  }

  private seedDefaultUsers(): void {
    const users: ManagedUser[] = [
      {
        userId: 'usr-sjenkins',
        email: 'sjenkins@metrohealth.org',
        fullName: 'Dr. Sarah Jenkins',
        role: 'PHYSICIAN',
        orgId: 'org-metrohealth',
        status: 'ACTIVE',
        delegatedAdmin: true,
        provisionedAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
      },
      {
        userId: 'usr-eclark',
        email: 'eclark@metrohealth.org',
        fullName: 'Nurse Emily Clark',
        role: 'NURSE',
        orgId: 'org-metrohealth',
        status: 'ACTIVE',
        delegatedAdmin: false,
        provisionedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const u of users) {
      this.userStore.set(u.userId, u);
    }
  }

  public provisionUser(
    email: string,
    fullName: string,
    role: MultidisciplinaryRole,
    orgId: string,
    delegatedAdmin = false
  ): ManagedUser {
    const userId = `usr-${crypto.randomUUID().slice(0, 8)}`;
    const user: ManagedUser = {
      userId,
      email,
      fullName,
      role,
      orgId,
      status: 'ACTIVE',
      delegatedAdmin,
      provisionedAt: new Date(),
    };

    this.userStore.set(userId, user);
    return user;
  }

  public updateUserStatus(userId: string, status: UserLifecycleStatus): ManagedUser {
    const user = this.userStore.get(userId);
    if (!user) throw new Error(`User ${userId} not found.`);

    user.status = status;
    this.userStore.set(userId, user);
    return user;
  }

  public getUsers(orgId?: string): ManagedUser[] {
    const all = Array.from(this.userStore.values());
    return orgId ? all.filter(u => u.orgId === orgId) : all;
  }
}
