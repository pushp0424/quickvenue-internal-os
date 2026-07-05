/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase/client'

function daysBetweenInclusive(startDate: string, endDate: string) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  return Math.round((end.getTime() - start.getTime()) / 86400000) + 1
}

// =========================================
// LEAVE TYPES
// =========================================
export async function getLeaveTypes(): Promise<Record<string, any>[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('leave_types' as any)
    .select('*')
    .eq('is_active', true)
    .order('created_at')
  if (error) throw error
  return (data ?? []) as any
}

// =========================================
// APPLY / MY LEAVES
// =========================================
export async function getMyLeaves(profileId: string): Promise<Record<string, any>[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('leaves' as any)
    .select('*, leave_type:leave_types(id, name)')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as any
}

export async function applyForLeave(input: {
  profileId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  reason?: string
  reportingManagerId?: string | null
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('leaves' as any)
    .insert({
      profile_id: input.profileId,
      leave_type_id: input.leaveTypeId,
      start_date: input.startDate,
      end_date: input.endDate,
      days: daysBetweenInclusive(input.startDate, input.endDate),
      reason: input.reason ?? null,
      status: input.reportingManagerId ? 'pending_team_lead' : 'pending_hr',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// =========================================
// APPROVALS
// =========================================
export async function getDirectReportIds(managerId: string): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('profiles' as any).select('id').eq('reporting_manager_id', managerId)
  if (error) throw error
  return (data ?? []).map((p: any) => p.id)
}

export async function getPendingApprovals(filters: { managerId?: string; isHR: boolean }): Promise<Record<string, any>[]> {
  const supabase = createClient()

  if (filters.isHR) {
    const { data, error } = await supabase
      .from('leaves' as any)
      .select('*, profile:profiles(id, full_name, avatar_url), leave_type:leave_types(id, name)')
      .in('status', ['pending_team_lead', 'pending_hr'])
      .order('created_at')
    if (error) throw error
    return (data ?? []) as any
  }

  if (!filters.managerId) return []
  const reportIds = await getDirectReportIds(filters.managerId)
  if (reportIds.length === 0) return []

  const { data, error } = await supabase
    .from('leaves' as any)
    .select('*, profile:profiles(id, full_name, avatar_url), leave_type:leave_types(id, name)')
    .in('profile_id', reportIds)
    .eq('status', 'pending_team_lead')
    .order('created_at')
  if (error) throw error
  return (data ?? []) as any
}

export async function decideLeave(id: string, input: {
  decision: 'approve' | 'reject'
  actingAsHR: boolean
  actingUserId: string
  rejectionReason?: string
}) {
  const supabase = createClient()

  if (input.decision === 'reject') {
    const update: Record<string, any> = {
      status: 'rejected',
      rejection_reason: input.rejectionReason ?? null,
    }
    if (input.actingAsHR) {
      update.hr_decided_by = input.actingUserId
      update.hr_decided_at = new Date().toISOString()
    } else {
      update.team_lead_decided_by = input.actingUserId
      update.team_lead_decided_at = new Date().toISOString()
    }
    const { data, error } = await supabase.from('leaves' as any).update(update).eq('id', id).select().single()
    if (error) throw error
    return data
  }

  // approve
  const update: Record<string, any> = input.actingAsHR
    ? { status: 'approved', hr_decided_by: input.actingUserId, hr_decided_at: new Date().toISOString() }
    : { status: 'pending_hr', team_lead_decided_by: input.actingUserId, team_lead_decided_at: new Date().toISOString() }

  const { data, error } = await supabase.from('leaves' as any).update(update).eq('id', id).select().single()
  if (error) throw error
  return data
}

// =========================================
// TEAM LEAVE CALENDAR
// =========================================
export async function getTeamLeaveCalendar(filters: {
  monthStart: string
  monthEnd: string
  managerId?: string
}): Promise<Record<string, any>[]> {
  const supabase = createClient()
  let q = supabase
    .from('leaves' as any)
    .select('*, profile:profiles(id, full_name), leave_type:leave_types(id, name)')
    .eq('status', 'approved')
    .lte('start_date', filters.monthEnd)
    .gte('end_date', filters.monthStart)

  if (filters.managerId) {
    const reportIds = await getDirectReportIds(filters.managerId)
    if (reportIds.length === 0) return []
    q = q.in('profile_id', reportIds)
  }

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as any
}
