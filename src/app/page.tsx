import { redirect } from 'next/navigation'
import { createClient } from '@/services/supabase/server'
import { getPrimaryDashboard } from '@/lib/constants'
import { RoleName } from '@/types/auth.types'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in')

  const { data: roleRows } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', user.id)

  const roles = (roleRows ?? []).map((r: any) => r.roles?.name).filter(Boolean) as RoleName[]

  if (roles.length === 0) {
    // Authenticated but no role assigned yet — block them, don't guess
    redirect('/sign-in?error=no_role_assigned')
  }

  redirect(getPrimaryDashboard(roles))
}