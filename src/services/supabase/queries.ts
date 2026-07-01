import { createClient } from '@/services/supabase/client'

// Total active team members
export async function getTeamStats() {
  const supabase = createClient()
  const { count: total } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: active } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  return { total: total ?? 0, active: active ?? 0 }
}

// Team members by role
export async function getTeamByRole() {
  const supabase = createClient()
  const { data } = await supabase
    .from('user_roles')
    .select('roles(name)')

  const counts: Record<string, number> = {}
  ;(data ?? []).forEach((row: any) => {
    const role = row.roles?.name
    if (role) counts[role] = (counts[role] ?? 0) + 1
  })
  return counts
}

// Team members by city
export async function getTeamByCity() {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('city')
    .eq('is_active', true)
    .not('city', 'is', null)

  const counts: Record<string, number> = {}
  ;(data ?? []).forEach((row: any) => {
    if (row.city) counts[row.city] = (counts[row.city] ?? 0) + 1
  })
  return counts
}

// Recent team members
export async function getRecentTeamMembers(limit = 5) {
  const supabase = createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email, city, designation, created_at, is_active')
    .order('created_at', { ascending: false })
    .limit(limit)

  return data ?? []
}
export async function getCRMSummary() {
  const supabase = createClient()

  const { count: totalVenues } = await supabase
    .from('venues')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { count: onboardedVenues } = await supabase
    .from('venues')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'onboarded')

  const { count: totalLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })

  const { count: wonLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'won')

  return {
    totalVenues: totalVenues ?? 0,
    onboardedVenues: onboardedVenues ?? 0,
    totalLeads: totalLeads ?? 0,
    wonLeads: wonLeads ?? 0,
  }
}