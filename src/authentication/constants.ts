import { ArrayElement } from '../types/common';

export const ADMIN_USER_NAME = 'admin';
export const RESTRICTED_ACCESS_ROLES = ['user', 'read-only'] as const;
export const ACCESS_ROLES = ['admin', ...RESTRICTED_ACCESS_ROLES] as const;
export type RestrictedAccessRole = ArrayElement<typeof RESTRICTED_ACCESS_ROLES>;
export type AccessRole = ArrayElement<typeof ACCESS_ROLES>;
