/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase/client'

export interface SalesKPIs {
  callsMade: number
  leadsAdded: number
  agreementsSigned: number
}

export interface HRKPIs {
  attendancePct: number
  hiringDone: number
}

// periodStart/periodEndExclusive are YYYY-MM-DD; periodEndExclusive is the
// day AFTER the period's last day, so timestamptz columns compare with `.lt()`.
export async function getSalesKPIs(userId: string, periodStart: string, periodEndExclusive: string): Promise<SalesKPIs> {
  const supabase = createClient()
  const [callsRes, b2bLeadsRes, b2cLeadsRes, agreementsRes] = await Promise.all([
    supabase.from('lead_activities' as any).select('id', { count: 'exact', head: true })
      .eq('performed_by', userId).eq('activity_type', 'call')
      .gte('created_at', periodStart).lt('created_at', periodEndExclusive),
    supabase.from('leads' as any).select('id', { count: 'exact', head: true })
      .eq('created_by', userId)
      .gte('created_at', periodStart).lt('created_at', periodEndExclusive),
    supabase.from('customer_leads' as any).select('id', { count: 'exact', head: true })
      .eq('created_by', userId)
      .gte('created_at', periodStart).lt('created_at', periodEndExclusive),
    supabase.from('leads' as any).select('id', { count: 'exact', head: true })
      .eq('assigned_to', userId).eq('pipeline_stage', 'agreement')
      .gte('updated_at', periodStart).lt('updated_at', periodEndExclusive),
  ])
  if (callsRes.error) throw callsRes.error
  if (b2bLeadsRes.error) throw b2bLeadsRes.error
  if (b2cLeadsRes.error) throw b2cLeadsRes.error
  if (agreementsRes.error) throw agreementsRes.error

  return {
    callsMade: callsRes.count ?? 0,
    leadsAdded: (b2bLeadsRes.count ?? 0) + (b2cLeadsRes.count ?? 0),
    agreementsSigned: agreementsRes.count ?? 0,
  }
}

export async function getHRKPIs(periodStart: string, periodEnd: string): Promise<HRKPIs> {
  const supabase = createClient()
  const [attendanceRes, hiringRes] = await Promise.all([
    supabase.from('attendance' as any).select('check_in_at')
      .gte('date', periodStart).lte('date', periodEnd),
    supabase.from('profiles' as any).select('id', { count: 'exact', head: true })
      .gte('date_of_joining', periodStart).lte('date_of_joining', periodEnd),
  ])
  if (attendanceRes.error) throw attendanceRes.error
  if (hiringRes.error) throw hiringRes.error

  const rows = (attendanceRes.data ?? []) as any[]
  const present = rows.filter((r) => r.check_in_at).length
  const attendancePct = rows.length > 0 ? Math.round((present / rows.length) * 100) : 0

  return { attendancePct, hiringDone: hiringRes.count ?? 0 }
}
