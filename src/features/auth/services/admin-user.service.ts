'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/services/supabase/server'
import { RoleName } from '@/types/auth.types'

// Service-role client — server-only, bypasses RLS. Never expose to browser.
function getAdminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function createTeamMember(input: {
  email: string
  fullName: string
  city?: string
  designation?: string
  role: RoleName
}) {
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
  if (!isAuthorized) throw new Error('Not authorized to create users')

  // 2. Create the auth user with service role (bypasses RLS)
  const admin = getAdminClient()
  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email: input.email,
    email_confirm: true,
    password: crypto.randomUUID(), // temp password — user resets via emailed link
    user_metadata: { full_name: input.fullName },
  })
  if (createError) throw createError

  // 3. profiles row auto-created by DB trigger — update extra fields
  await admin
    .from('profiles')
    .update({ city: input.city, designation: input.designation })
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

  // 5. Trigger password-set email
  await admin.auth.resetPasswordForEmail(input.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
  })

  return newUser.user
}