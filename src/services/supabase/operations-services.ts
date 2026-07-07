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

export interface OperationsBreakdowns {
  byAgreementStatus: { label: string; value: number }[]
  byCategory: { label: string; value: number }[]
  testBookingRate: number
  listedRate: number
}

export async function getOperationsBreakdowns(): Promise<OperationsBreakdowns> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('venues')
    .select('category, agreement_status, test_booking_done, listed_on_platform')
    .eq('is_active', true)
  if (error) throw error

  const rows = (data ?? []) as any[]
  const agreementCounts = new Map<string, number>()
  const categoryCounts = new Map<string, number>()
  let testBookingDone = 0
  let listed = 0

  rows.forEach((v) => {
    const agreementLabel = v.agreement_status ? String(v.agreement_status).replace(/_/g, ' ') : 'Not started'
    agreementCounts.set(agreementLabel, (agreementCounts.get(agreementLabel) ?? 0) + 1)
    const categoryLabel = v.category ? String(v.category).replace(/_/g, ' ') : 'Uncategorized'
    categoryCounts.set(categoryLabel, (categoryCounts.get(categoryLabel) ?? 0) + 1)
    if (v.test_booking_done) testBookingDone++
    if (v.listed_on_platform) listed++
  })

  return {
    byAgreementStatus: Array.from(agreementCounts.entries()).map(([label, value]) => ({ label, value })),
    byCategory: Array.from(categoryCounts.entries()).map(([label, value]) => ({ label, value })),
    testBookingRate: rows.length > 0 ? Math.round((testBookingDone / rows.length) * 100) : 0,
    listedRate: rows.length > 0 ? Math.round((listed / rows.length) * 100) : 0,
  }
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

export async function createVenueOperations(input: Record<string, any>) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('venues')
    .insert({ ...input, created_by: user?.id ?? null } as any)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteVenueOperations(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('venues')
    .update({ is_active: false } as any)
    .eq('id', id)
  if (error) throw error
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
