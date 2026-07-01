import { isCityScoped } from '@/lib/permissions'
import { RoleName } from '@/types/auth.types'

// Apply this to any Supabase query builder that has a `city` column
export function applyCityScope<T extends { eq: Function }>(
  query: T,
  userRoles: RoleName[],
  userCity: string | null
): T {
  if (isCityScoped(userRoles) && userCity) {
    return query.eq('city', userCity)
  }
  return query
}