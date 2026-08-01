const PERMISSIONS: Record<string, string[]> = {
  patient: ['read:own_profile', 'write:own_profile', 'read:own_dashboard', 'read:own_timeline', 'read:own_medications', 'write:own_medications', 'read:own_care_plan', 'read:own_assessments', 'write:own_assessments', 'read:own_preventive'],
  clinician: ['read:own_profile', 'write:own_profile', 'read:patient_profiles', 'read:patient_dashboards', 'write:care_plans', 'write:assessments', 'read:all_assessments'],
  admin: ['*']
};

export function hasPermission(role: string, permission: string): boolean {
  const perms = PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes('*') || perms.includes(permission);
}

export function getPermissions(role: string): string[] {
  return PERMISSIONS[role] || [];
}
