import { RoleName } from '@/types/auth.types'

// Which roles can access which dashboard route prefix
export const ROUTE_ACCESS: Record<string, RoleName[]> = {
  '/founder': ['founder'],
  '/admin': ['founder', 'admin'],
  '/city': ['founder', 'admin', 'city_lead', 'venue_acquisition_executive'],
  '/sales': ['founder', 'admin', 'sales_executive', 'operations_executive'],
  '/developer': ['founder', 'developer'],
  '/hr': ['founder', 'admin', 'hr'],
}

// Discrete permission flags for fine-grained UI/server checks
// beyond simple route prefixes
export const PERMISSIONS = {
  MANAGE_USERS: ['founder', 'admin'] as RoleName[],
  VIEW_ALL_CITIES: ['founder', 'admin'] as RoleName[],
  MANAGE_ROLES: ['founder', 'admin'] as RoleName[],
  VIEW_ALL_LEADS: ['founder', 'admin'] as RoleName[],
  MANAGE_DEV_MODULES: ['founder', 'developer'] as RoleName[],
  MANAGE_HR: ['founder', 'admin', 'hr'] as RoleName[],
} as const

export type PermissionKey = keyof typeof PERMISSIONS

export function hasPermission(userRoles: RoleName[], permission: PermissionKey): boolean {
  return PERMISSIONS[permission].some((allowed) => userRoles.includes(allowed))
}

export function canAccessRoute(userRoles: RoleName[], pathname: string): boolean {
  const matchedPrefix = Object.keys(ROUTE_ACCESS).find((prefix) =>
    pathname.startsWith(prefix)
  )
  if (!matchedPrefix) return true // route not in the protected map, e.g. shared pages
  return ROUTE_ACCESS[matchedPrefix].some((allowed) => userRoles.includes(allowed))
}

export function isCityScoped(userRoles: RoleName[]): boolean {
  // True if user should only see their own city's data (not founder/admin)
  return (
    (userRoles.includes('city_lead') || userRoles.includes('venue_acquisition_executive')) &&
    !userRoles.includes('founder') &&
    !userRoles.includes('admin')
  )
}