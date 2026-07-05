'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/services/supabase/server'
import { RoleName } from '@/types/auth.types'
import { generateTempPassword } from '@/features/team/utils/generate-password'

function getAdminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface CreateMemberInput {
  email: string
  fullName: string
  phone?: string
  city?: string
  designation?: string
  role: RoleName
}

export async function createMemberAction(input: CreateMemberInput) {
  // 1. Verify caller is admin/founder
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: callerRoles } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', user.id)

  const isAuthorized = (callerRoles ?? []).some(
    (r: any) => r.roles?.name === 'founder' || r.roles?.name === 'admin'
  )
  if (!isAuthorized) throw new Error('Not authorized')

  // 2. Create auth user with a real, usable password
  const admin = getAdminClient()
  const password = generateTempPassword()
  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email: input.email,
    email_confirm: true,
    password,
    user_metadata: { full_name: input.fullName },
  })
  if (createError) throw createError

  // 3. Update profile with extra fields
  await admin
    .from('profiles')
    .update({
      phone: input.phone ?? null,
      city: input.city ?? null,
      designation: input.designation ?? null,
    })
    .eq('id', newUser.user.id)

  // 4. Assign role
  const { data: roleRow } = await admin
    .from('roles')
    .select('id')
    .eq('name', input.role)
    .single()

  if (roleRow) {
    await admin.from('user_roles').insert({
      user_id: newUser.user.id,
      role_id: roleRow.id,
      assigned_by: user.id,
    })
  }

  return { success: true, userId: newUser.user.id, password }
}