import type { Profile, UserRole } from './types'

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  developer: 400,
  admin: 300,
  seller: 200,
  user: 100,
}

export function hasRole(profile: Partial<Profile> | null | undefined, minRole: UserRole): boolean {
  if (!profile || !profile.role) return false
  const userLevel = ROLE_HIERARCHY[profile.role] || 0
  const requiredLevel = ROLE_HIERARCHY[minRole] || 0
  return userLevel >= requiredLevel
}

export function canManageUser(actor: Partial<Profile>, targetRole: UserRole): boolean {
  if (actor.role === 'developer') return true
  if (actor.role === 'admin' && targetRole !== 'developer' && targetRole !== 'admin') return true
  return false
}

export function isImmutable(profile: Partial<Profile>): boolean {
  return profile.role === 'developer'
}

export const PERMISSIONS = {
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_USERS: 'manage_users',
  MANAGE_SELLERS: 'manage_sellers',
  MANAGE_ROLES: 'manage_roles',
  VIEW_LOGS: 'view_logs',
  MODERATE_CONTENT: 'moderate_content',
  SYSTEM_CONFIG: 'system_config',
} as const

type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  developer: Object.values(PERMISSIONS),
  admin: [
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_SELLERS,
    PERMISSIONS.MODERATE_CONTENT,
  ],
  seller: [],
  user: [],
}

export function canAccess(profile: Partial<Profile> | null | undefined, permission: Permission): boolean {
  if (!profile || !profile.role) return false
  if (profile.role === 'developer') return true
  const perms = ROLE_PERMISSIONS[profile.role] || []
  return perms.includes(permission)
}
