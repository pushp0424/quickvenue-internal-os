export type RoleName =
  | 'founder'
  | 'admin'
  | 'city_lead'
  | 'sales_executive'
  | 'operations_executive'
  | 'venue_acquisition_executive'
  | 'developer'
  | 'hr'

export interface UserProfile {
  id: string
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  city: string | null
  designation: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthUser {
  profile: UserProfile
  roles: RoleName[]
}