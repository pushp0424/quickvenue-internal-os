import { RoleName } from '@/types/auth.types'

export const ROUTE_ACCESS: Record<string, RoleName[]> = {
  '/founder':   ['founder'],
  '/admin':     ['founder', 'admin'],
  '/city':      ['founder', 'admin', 'city_lead', 'venue_acquisition_executive', 'operations_head'],
  '/sales':     ['founder', 'admin', 'sales_executive', 'operations_executive', 'sales_head'],
  '/developer': ['founder', 'developer'],
  '/hr':        ['founder', 'admin', 'hr'],
  '/settings':  ['founder', 'admin', 'city_lead', 'sales_executive', 'operations_executive', 'venue_acquisition_executive', 'developer', 'hr', 'bda', 'sales_head', 'operations_head', 'finance', 'marketing_head', 'team_lead'],
  '/crm':       ['founder', 'admin', 'city_lead', 'sales_executive', 'operations_executive', 'bda', 'sales_head', 'operations_head'],
  '/b2b':       ['founder', 'admin', 'city_lead', 'venue_acquisition_executive', 'operations_head', 'bda'],
  '/b2c':       ['founder', 'admin', 'sales_executive', 'sales_head', 'bda', 'city_lead'],
  '/operations': ['founder', 'admin', 'operations_head', 'city_lead'],
  '/finance':    ['founder', 'finance'],
  '/attendance': ['founder', 'admin', 'city_lead', 'sales_executive', 'operations_executive', 'venue_acquisition_executive', 'developer', 'hr', 'bda', 'sales_head', 'operations_head', 'finance', 'marketing_head', 'team_lead'],
  '/leaves':     ['founder', 'admin', 'city_lead', 'sales_executive', 'operations_executive', 'venue_acquisition_executive', 'developer', 'hr', 'bda', 'sales_head', 'operations_head', 'finance', 'marketing_head', 'team_lead'],
  '/payroll':    ['founder', 'admin', 'city_lead', 'sales_executive', 'operations_executive', 'venue_acquisition_executive', 'developer', 'hr', 'bda', 'sales_head', 'operations_head', 'finance', 'marketing_head', 'team_lead'],
}

export const PERMISSIONS = {
  MANAGE_USERS:        ['founder', 'admin'] as RoleName[],
  VIEW_ALL_CITIES:     ['founder', 'admin'] as RoleName[],
  MANAGE_ROLES:        ['founder', 'admin'] as RoleName[],
  VIEW_ALL_LEADS:      ['founder', 'admin', 'sales_head'] as RoleName[],
  MANAGE_DEV_MODULES:  ['founder', 'developer'] as RoleName[],
  MANAGE_HR:           ['founder', 'admin', 'hr'] as RoleName[],
  ADD_LEADS:           ['founder', 'admin', 'sales_executive', 'bda', 'city_lead', 'sales_head'] as RoleName[],
  ADD_VENUES:          ['founder', 'admin', 'city_lead', 'venue_acquisition_executive', 'bda', 'operations_head'] as RoleName[],
  VIEW_FINANCE:        ['founder', 'finance'] as RoleName[],
  DELETE_LEADS:        ['founder', 'admin'] as RoleName[],
  VIEW_SALARY:         ['founder', 'hr'] as RoleName[],
  VIEW_BANK_DETAILS:   ['founder', 'hr'] as RoleName[],
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
      userRoles.includes('venue_acquisition_executive') ||
      userRoles.includes('bda')) &&
    !userRoles.includes('founder') &&
    !userRoles.includes('admin')
  )
}

const ROLE_PRIORITY: RoleName[] = [
  'founder', 'admin', 'developer', 'hr', 'finance',
  'sales_head', 'operations_head', 'marketing_head',
  'city_lead', 'team_lead', 'sales_executive',
  'operations_executive', 'venue_acquisition_executive', 'bda',
]

const ROLE_DASHBOARD_MAP: Record<RoleName, string> = {
  founder:                      '/founder',
  admin:                        '/admin',
  city_lead:                    '/city',
  sales_executive:              '/b2c',
  operations_executive:         '/b2b',
  venue_acquisition_executive:  '/b2b',
  developer:                    '/developer',
  hr:                           '/hr',
  bda:                          '/crm',
  sales_head:                   '/b2c',
  operations_head:              '/b2b',
  finance:                      '/finance',
  marketing_head:               '/sales',
  team_lead:                    '/crm',
}

export function getPrimaryDashboard(roles: RoleName[]): string {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) return ROLE_DASHBOARD_MAP[role]
  }
  return '/sign-in'
}