import { createClient } from '@/services/supabase/client'
import {
  Venue, Lead, VenueStatus, LeadStatus,
} from '@/types/database.types'

// =========================================
// VENUE QUERIES
// =========================================

export async function getVenues(filters?: {
  city?: string
  status?: VenueStatus
  category?: string
  search?: string
}) {
  const supabase = createClient()
  let query = supabase
    .from('venues')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (filters?.city) query = query.eq('city', filters.city)
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,owner_name.ilike.%${filters.search}%,area.ilike.%${filters.search}%`
    )
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Venue[]
}

export async function getVenueById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Venue
}

export async function getVenueStats() {
  const supabase = createClient()
  const { data } = await supabase
    .from('venues')
    .select('status')
    .eq('is_active', true)

  const counts: Record<string, number> = {
    prospect: 0,
    contacted: 0,
    negotiating: 0,
    onboarded: 0,
    inactive: 0,
  }
  ;(data ?? []).forEach((v: any) => {
    if (v.status in counts) counts[v.status]++
  })
  return counts
}

export async function createVenue(
  input: Record<string, any>
) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('venues')
    .insert({
      ...input,
      created_by: user?.id ?? null,
    } as any)
    .select()
    .single()

  if (error) throw error
  return data as Venue
}

export async function updateVenue(
  id: string,
  input: Record<string, any>
) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('venues')
    .update({
      ...input,
      updated_by: user?.id ?? null,
    } as any)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Venue
}

// =========================================
// LEAD QUERIES
// =========================================

export async function getLeads(filters?: {
  status?: LeadStatus
  assignedTo?: string
  venueCity?: string
  search?: string
}) {
  const supabase = createClient()
  let query = supabase
    .from('leads')
    .select(`
      *,
      venue:venues(id, name, city, category, area),
      assignee:profiles!leads_assigned_to_fkey(id, full_name, avatar_url)
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.assignedTo) query = query.eq('assigned_to', filters.assignedTo)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getLeadStats() {
  const supabase = createClient()
  const { data } = await supabase
    .from('leads')
    .select('status, priority')

  const byStatus: Record<string, number> = {}
  const byPriority: Record<string, number> = {}

  ;(data ?? []).forEach((l: any) => {
    byStatus[l.status] = (byStatus[l.status] ?? 0) + 1
    byPriority[l.priority] = (byPriority[l.priority] ?? 0) + 1
  })

  return { byStatus, byPriority, total: data?.length ?? 0 }
}

export async function createLead(input: Record<string, any>) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('leads')
    .insert({
      ...input,
      created_by: user?.id ?? null,
    } as any)
    .select()
    .single()

  if (error) throw error
  return data as Lead
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
  notes?: string
) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('leads')
    .update({
      status,
      ...(notes ? { notes } : {}),
      last_contacted_at: new Date().toISOString(),
    } as any)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Lead
}

export async function getLeadActivities(leadId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('lead_activities')
    .select(`
      *,
      performer:profiles!lead_activities_performed_by_fkey(id, full_name)
    `)
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function logLeadActivity(input: {
  leadId: string
  activityType: string
  content: string
  metadata?: Record<string, any>
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('lead_activities')
    .insert({
      lead_id: input.leadId,
      performed_by: user?.id ?? null,
      activity_type: input.activityType,
      content: input.content,
      metadata: input.metadata ?? null,
    } as any)

  if (error) throw error
}