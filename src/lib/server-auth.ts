import { createClient } from '@/services/supabase/server'
import { hasPermission, PermissionKey } from '@/lib/permissions'
import { RoleName } from '@/types/auth.types'

export class UnauthorizedError extends Error {
  constructor(message = 'Not authorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export async function getServerUserRoles(): Promise<{ userId: string; roles: RoleName[] }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new UnauthorizedError('Not authenticated')

  const { data: roleRows } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', user.id)

  const roles = (roleRows ?? []).map((r: any) => r.roles?.name).filter(Boolean) as RoleName[]
  return { userId: user.id, roles }
}

export async function requirePermission(permission: PermissionKey) {
  const { userId, roles } = await getServerUserRoles()
  if (!hasPermission(roles, permission)) {
    throw new UnauthorizedError(`Missing permission: ${permission}`)
  }
  return { userId, roles }
}