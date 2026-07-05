export type RoleName =
  | 'founder'
  | 'admin'
  | 'city_lead'
  | 'sales_executive'
  | 'operations_executive'
  | 'venue_acquisition_executive'
  | 'developer'
  | 'hr'
  | 'bda'
  | 'sales_head'
  | 'operations_head'
  | 'finance'
  | 'marketing_head'
  | 'team_lead'

export interface UserProfile {
  id: string
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  city: string | null
  city_id: string | null
  designation: string | null
  team: string | null
  reporting_manager_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthUser {
  profile: UserProfile
  roles: RoleName[]
}