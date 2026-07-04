import {
  LayoutDashboard, Users, MapPin,
  TrendingUp, Code2, UserCog, Settings,
  Building2, ShoppingBag, ClipboardList,
} from 'lucide-react'
import { RoleName } from '@/types/auth.types'

export interface NavItem {
  label: string
  href: string
  icon: any
  roles: RoleName[]
}

const ALL_ROLES: RoleName[] = [
  'founder', 'admin', 'city_lead', 'sales_executive',
  'operations_executive', 'venue_acquisition_executive',
  'developer', 'hr', 'bda', 'sales_head',
  'operations_head', 'finance', 'marketing_head', 'team_lead',
]

export const NAV_ITEMS: NavItem[] = [
  { label: 'Founder Overview', href: '/founder',    icon: LayoutDashboard, roles: ['founder'] },
  { label: 'Admin Dashboard',  href: '/admin',      icon: LayoutDashboard, roles: ['founder', 'admin'] },
  { label: 'Team Management',  href: '/admin/team', icon: Users,           roles: ['founder', 'admin'] },
  { label: 'B2B CRM',          href: '/b2b',        icon: Building2,       roles: ['founder', 'admin', 'city_lead', 'venue_acquisition_executive', 'operations_head', 'bda'] },
  { label: 'B2C CRM',          href: '/b2c',        icon: ShoppingBag,     roles: ['founder', 'admin', 'sales_executive', 'sales_head', 'bda', 'city_lead'] },
  { label: 'My CRM',           href: '/crm',        icon: ClipboardList,   roles: ['bda', 'team_lead', 'sales_executive', 'operations_executive'] },
  { label: 'City Dashboard',   href: '/city',       icon: MapPin,          roles: ['founder', 'admin', 'city_lead', 'venue_acquisition_executive', 'operations_head'] },
  { label: 'Sales Dashboard',  href: '/sales',      icon: TrendingUp,      roles: ['founder', 'admin', 'sales_executive', 'operations_executive', 'sales_head'] },
  { label: 'Developer Tools',  href: '/developer',  icon: Code2,           roles: ['founder', 'developer'] },
  { label: 'HR Dashboard',     href: '/hr',         icon: UserCog,         roles: ['founder', 'admin', 'hr'] },
  { label: 'Settings',         href: '/settings',   icon: Settings,        roles: ALL_ROLES },
]

export function getVisibleNavItems(userRoles: RoleName[]): NavItem[] {
  return NAV_ITEMS.filter((item) =>
    item.roles.some((r) => userRoles.includes(r))
  )
}