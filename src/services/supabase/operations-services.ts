/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase/client'

// =========================================
// VENUE ONBOARDING
// =========================================
export async function getOperationsVenues(filters?: {
  cityId?: string
  status?: string
  search?: string
}): Promise<Record<string, any>[]> {
  const supabase = createClient()
  let q = supabase
    .from('venues')
    .select('*, city_ref:cities(id, name), assignee:profiles!venues_assigned_to_fkey(id, full_name, avatar_url)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (filters?.cityId) q = q.eq('city_id', filters.cityId)
  if (filters?.status) q = q.eq('status', filters.status)
  if (filters?.search) {
    q = q.or(`name.ilike.%${filters.search}%,owner_name.ilike.%${filters.search}%`)
  }

  const { data, error } = await q
  if (error) throw error
  return data ?? []
}

export async function getOperationsStats() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('venues')
    .select('status, updated_at, agreement_expiry')
    .eq('is_active', true)
  if (error) throw error

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const in30Days = new Date(now.getTime() + 30 * 86400000)

  let onboardedThisMonth = 0
  let pendingOnboarding = 0
  let expiringAgreements = 0

  ;(data ?? []).forEach((v: any) => {
    if (v.status === 'onboarded') {
      if (v.updated_at && new Date(v.updated_at) >= startOfMonth) onboardedThisMonth++
    } else {
      pendingOnboarding++
    }
    if (v.agreement_expiry) {
      const expiry = new Date(v.agreement_expiry)
      if (expiry >= now && expiry <= in30Days) expiringAgreements++
    }
  })

  return { onboardedThisMonth, pendingOnboarding, expiringAgreements, total: data?.length ?? 0 }
}

export async function updateVenueOperations(id: string, input: Record<string, any>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('venues')
    .update(input as any)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// =========================================
// VENDORS
// =========================================
export async function getVendors(filters?: { cityId?: string; search?: string }): Promise<Record<string, any>[]> {
  const supabase = createClient()
  let q = supabase
    .from('vendors' as any)
    .select('*, city:cities(id, name)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (filters?.cityId) q = q.eq('city_id', filters.cityId)
  if (filters?.search) q = q.ilike('name', `%${filters.search}%`)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as any
}

export async function createVendor(input: Record<string, any>) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const { data, error } = await supabase
    .from('vendors' as any)
    .insert({ ...input, created_by: session?.user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateVendor(id: string, input: Record<string, any>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('vendors' as any)
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteVendor(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('vendors' as any).update({ is_active: false }).eq('id', id)
  if (error) throw error
}
