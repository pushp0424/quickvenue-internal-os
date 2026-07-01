import { RoleName } from '@/types/auth.types'

export const ROLE_DASHBOARD_MAP: Record<RoleName, string> = {
  founder: '/founder',
  admin: '/admin',
  city_lead: '/city',
  sales_executive: '/sales',
  operations_executive: '/sales', // shares ops view under sales for now
  venue_acquisition_executive: '/city',
  developer: '/developer',
  hr: '/hr',
}

// Priority order — if a user has multiple roles, highest priority wins for default redirect
export const ROLE_PRIORITY: RoleName[] = [
  'founder',
  'admin',
  'developer',
  'hr',
  'city_lead',
  'sales_executive',
  'operations_executive',
  'venue_acquisition_executive',
]

export function getPrimaryDashboard(roles: RoleName[]): string {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) return ROLE_DASHBOARD_MAP[role]
  }
  return '/sign-in'
}