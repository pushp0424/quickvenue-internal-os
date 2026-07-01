import { createClient } from '@/services/supabase/client'
import { RoleName } from '@/types/auth.types'

export interface TeamMember {
  id: string
  full_name: string
  email: string
  phone: string | null
  city: string | null
  designation: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  roles: RoleName[]
}

export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const supabase = createClient()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('user_id, roles(name)')

  const roleMap: Record<string, RoleName[]> = {}
  ;(userRoles ?? []).forEach((ur: any) => {
    const role = ur.roles?.name as RoleName
    if (!roleMap[ur.user_id]) roleMap[ur.user_id] = []
    if (role) roleMap[ur.user_id].push(role)
  })

  return (profiles ?? []).map((p) => ({
    ...p,
    roles: roleMap[p.id] ?? [],
  }))
}

export async function deactivateMember(userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', userId)
  if (error) throw error
}

export async function reactivateMember(userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: true })
    .eq('id', userId)
  if (error) throw error
}

export async function updateMemberRole(
  userId: string,
  newRole: RoleName
): Promise<void> {
  const supabase = createClient()

  // Get role id
  const { data: roleRow } = await supabase
    .from('roles')
    .select('id')
    .eq('name', newRole)
    .single()

  if (!roleRow) throw new Error('Role not found')

  // Remove existing roles
  await supabase.from('user_roles').delete().eq('user_id', userId)

  // Assign new role
  const { error } = await supabase.from('user_roles').insert({
    user_id: userId,
    role_id: roleRow.id,
  })
  if (error) throw error
}