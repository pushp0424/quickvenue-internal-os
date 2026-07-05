'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/services/supabase/server'
import { generateTempPassword } from '@/features/team/utils/generate-password'

function getAdminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function resetMemberPasswordAction(userId: string) {
  // 1. Verify caller is admin/founder
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: callerRoles } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', user.id)

  const isAuthorized = (callerRoles ?? []).some(
    (r: { roles: { name: string } | null }) => r.roles?.name === 'founder' || r.roles?.name === 'admin'
  )
  if (!isAuthorized) throw new Error('Not authorized')

  // 2. Set a new password
  const admin = getAdminClient()
  const password = generateTempPassword()
  const { error } = await admin.auth.admin.updateUserById(userId, { password })
  if (error) throw error

  return { success: true, password }
}
