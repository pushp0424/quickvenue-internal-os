import { RoleName } from '@/types/auth.types'

export const ROUTE_ACCESS: Record<string, RoleName[]> = {
  '/founder':   ['founder'],
  '/admin':     ['founder', 'admin'],
  '/city':      ['founder', 'admin', 'city_lead', 'venue_acquisition_executive'],
  '/sales':     ['founder', 'admin', 'sales_executive', 'operations_executive'],
  '/developer': ['founder', 'developer'],
  '/hr':        ['founder', 'admin', 'hr'],
}

export const PERMISSIONS = {
  MANAGE_USERS:      ['founder', 'admin'] as RoleName[],
  VIEW_ALL_CITIES:   ['founder', 'admin'] as RoleName[],
  MANAGE_ROLES:      ['founder', 'admin'] as RoleName[],
  VIEW_ALL_LEADS:    ['founder', 'admin'] as RoleName[],
  MANAGE_DEV_MODULES:['founder', 'developer'] as RoleName[],
  MANAGE_HR:         ['founder', 'admin', 'hr'] as RoleName[],
} as const

export type PermissionKey = keyof typeof PERMISSIONS

export function hasPermission(userRoles: RoleName[], permission: PermissionKey): boolean {
  return PERMISSIONS[permission].some((r) => userRoles.includes(r))
}

export function canAccessRoute(userRoles: RoleName[], pathname: string): boolean {
  const matched = Object.keys(ROUTE_ACCESS).find((prefix) =>
    pathname.startsWith(prefix)
  )
  if (!matched) return true
  return ROUTE_ACCESS[matched].some((r) => userRoles.includes(r))
}

export function isCityScoped(userRoles: RoleName[]): boolean {
  return (
    (userRoles.includes('city_lead') ||
      userRoles.includes('venue_acquisition_executive')) &&
    !userRoles.includes('founder') &&
    !userRoles.includes('admin')
  )
}

const ROLE_PRIORITY: RoleName[] = [
  'founder', 'admin', 'developer', 'hr',
  'city_lead', 'sales_executive',
  'operations_executive', 'venue_acquisition_executive',
]

const ROLE_DASHBOARD_MAP: Record<RoleName, string> = {
  founder:                      '/founder',
  admin:                        '/admin',
  city_lead:                    '/city',
  sales_executive:              '/sales',
  operations_executive:         '/sales',
  venue_acquisition_executive:  '/city',
  developer:                    '/developer',
  hr:                           '/hr',
}

export function getPrimaryDashboard(roles: RoleName[]): string {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) return ROLE_DASHBOARD_MAP[role]
  }
  return '/sign-in'
}