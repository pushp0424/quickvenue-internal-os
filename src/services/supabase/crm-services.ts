/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase/client'
import type { Activity } from '@/components/shared/activity-timeline'

async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// =========================================
// CITIES
// =========================================
export async function getCities(): Promise<{ id: string; name: string }[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cities' as any)
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return (data ?? []) as any
}

// =========================================
// B2B CRM
// =========================================
export async function getB2BLeads(filters?: {
  cityId?: string
  stage?: string
  search?: string
  assignedTo?: string
}): Promise<Record<string, any>[]> {
  const supabase = createClient()
  let q = supabase
    .from('leads' as any)
    .select('*')
    .eq('lead_type', 'b2b')
    .order('created_at', { ascending: false })

  if (filters?.cityId) q = q.eq('city_id', filters.cityId)
  if (filters?.stage) q = q.eq('pipeline_stage', filters.stage)
  if (filters?.assignedTo) q = q.eq('assigned_to', filters.assignedTo)
  if (filters?.search) {
    q = q.or(`venue_name.ilike.%${filters.search}%,owner_name.ilike.%${filters.search}%`)
  }

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as any
}

export async function getB2BStats() {
  const supabase = createClient()
  const { data } = await supabase
    .from('leads' as any)
    .select('pipeline_stage')
    .eq('lead_type', 'b2b')

  const counts: Record<string, number> = {
    prospect: 0, contacted: 0, meeting: 0,
    negotiation: 0, agreement: 0, onboarded: 0,
  }
  ;(data ?? []).forEach((l: any) => {
    if (l.pipeline_stage in counts) counts[l.pipeline_stage]++
  })
  return counts
}

export async function createB2BLead(input: Record<string, any>) {
  const supabase = createClient()
  const session = await getSession()
  const { data, error } = await supabase
    .from('leads' as any)
    .insert({
      ...input,
      lead_type: 'b2b',
      created_by: session?.user.id,
      assigned_to: input.assigned_to ?? session?.user.id,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateB2BLeadStage(id: string, stage: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('leads' as any)
    .update({ pipeline_stage: stage })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getB2BLeadById(id: string): Promise<Record<string, any>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('leads' as any)
    .select('*, assignee:profiles!leads_assigned_to_fkey(id, full_name, avatar_url), city:cities(id, name)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as any
}

export async function updateB2BLead(id: string, input: Record<string, any>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('leads' as any)
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getB2BLeadActivities(leadId: string): Promise<Activity[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('lead_activities')
    .select('*, performer:profiles!lead_activities_performed_by_fkey(id, full_name)')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as any
}

export async function logB2BLeadActivity(input: {
  leadId: string
  activityType: string
  content: string
}) {
  const supabase = createClient()
  const session = await getSession()
  const { error } = await supabase
    .from('lead_activities')
    .insert({
      lead_id: input.leadId,
      performed_by: session?.user.id ?? null,
      activity_type: input.activityType,
      content: input.content,
    } as any)
  if (error) throw error
}

// =========================================
// B2C CRM
// =========================================
export async function getB2CLeads(filters?: {
  cityId?: string
  stage?: string
  search?: string
  assignedTo?: string
}): Promise<Record<string, any>[]> {
  const supabase = createClient()
  let q = supabase
    .from('customer_leads' as any)
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.cityId) q = q.eq('city_id', filters.cityId)
  if (filters?.stage) q = q.eq('pipeline_stage', filters.stage)
  if (filters?.assignedTo) q = q.eq('assigned_to', filters.assignedTo)
  if (filters?.search) {
    q = q.or(`customer_name.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%`)
  }

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as any
}

export async function getB2CStats() {
  const supabase = createClient()
  const { data } = await supabase
    .from('customer_leads' as any)
    .select('pipeline_stage, booking_amount')

  const counts: Record<string, number> = {
    new_lead: 0, qualified: 0, venue_shared: 0,
    site_visit: 0, negotiation: 0, booked: 0,
    completed: 0, lost: 0,
  }
  let totalRevenue = 0

  ;(data ?? []).forEach((l: any) => {
    if (l.pipeline_stage in counts) counts[l.pipeline_stage]++
    if (['booked', 'completed'].includes(l.pipeline_stage)) {
      totalRevenue += Number(l.booking_amount ?? 0)
    }
  })

  return { counts, totalRevenue, total: data?.length ?? 0 }
}

export async function createB2CLead(input: Record<string, any>) {
  const supabase = createClient()
  const session = await getSession()
  const { data, error } = await supabase
    .from('customer_leads' as any)
    .insert({
      ...input,
      created_by: session?.user.id,
      assigned_to: input.assigned_to ?? session?.user.id,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateB2CLeadStage(
  id: string,
  stage: string,
  extra?: Record<string, any>
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('customer_leads' as any)
    .update({
      pipeline_stage: stage,
      last_contacted_at: new Date().toISOString(),
      ...extra,
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getB2CLeadById(id: string): Promise<Record<string, any>> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('customer_leads' as any)
    .select('*, assignee:profiles!customer_leads_assigned_to_fkey(id, full_name, avatar_url), city:cities(id, name)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as any
}

export async function updateB2CLead(id: string, input: Record<string, any>) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('customer_leads' as any)
    .update(input)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getB2CLeadActivities(customerLeadId: string): Promise<Activity[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('customer_lead_activities')
    .select('*, performer:profiles!customer_lead_activities_performed_by_fkey(id, full_name)')
    .eq('customer_lead_id', customerLeadId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as any
}

export async function logB2CLeadActivity(input: {
  customerLeadId: string
  activityType: string
  content: string
}) {
  const supabase = createClient()
  const session = await getSession()
  const { error } = await supabase
    .from('customer_lead_activities')
    .insert({
      customer_lead_id: input.customerLeadId,
      performed_by: session?.user.id ?? null,
      activity_type: input.activityType,
      content: input.content,
    } as any)
  if (error) throw error
}