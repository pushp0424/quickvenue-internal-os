/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase/client'
import { toLocalDateStr, getWeekStart } from '@/lib/utils'

export interface SalesOverview {
  totalLeads: number
  wonCount: number
  totalRevenue: number
  newThisWeek: number
}

export interface SalesLeaderboardEntry {
  profileId: string
  fullName: string
  avatarUrl: string | null
  wonCount: number
  revenue: number
}

export interface SalesCityBreakdownEntry {
  cityName: string
  leadCount: number
}

export interface RecentLeadEntry {
  id: string
  type: 'b2b' | 'b2c'
  name: string
  cityName: string | null
  stage: string
  assigneeName: string | null
  createdAt: string
}

export interface SalesDashboardData {
  overview: SalesOverview
  leaderboard: SalesLeaderboardEntry[]
  cityBreakdown: SalesCityBreakdownEntry[]
  recentLeads: RecentLeadEntry[]
}

// Single combined fetch (one round trip per lead type) — the overview,
// leaderboard, city breakdown, and recent-leads list are all derived views
// over the same B2B + B2C rows, so there's no reason to re-query per view.
// This deliberately replaces the old /sales data source (crm-queries.ts's
// getLeads/getLeadStats, which group by the legacy `leads.status` column —
// a field B2B lead creation never actually sets, since it only writes
// `pipeline_stage`. That made the old Sales dashboard's KPI cards count the
// wrong field entirely.) with the same `pipeline_stage`-based source `/b2b`
// and `/b2c` already use correctly.
export async function getSalesDashboardData(limit = { leaderboard: 5, recent: 10 }): Promise<SalesDashboardData> {
  const supabase = createClient()
  const weekStart = toLocalDateStr(getWeekStart(new Date()))

  const [b2bRes, b2cRes] = await Promise.all([
    supabase
      .from('leads' as any)
      .select('id, venue_name, pipeline_stage, deal_value, assigned_to, city_id, created_at, assignee:profiles!leads_assigned_to_fkey(id, full_name, avatar_url), city:cities(id, name)')
      .eq('lead_type', 'b2b')
      .order('created_at', { ascending: false }),
    supabase
      .from('customer_leads' as any)
      .select('id, customer_name, pipeline_stage, booking_amount, assigned_to, city_id, preferred_city, created_at, assignee:profiles!customer_leads_assigned_to_fkey(id, full_name, avatar_url), city:cities(id, name)')
      .order('created_at', { ascending: false }),
  ])
  if (b2bRes.error) throw b2bRes.error
  if (b2cRes.error) throw b2cRes.error

  const b2b = (b2bRes.data ?? []) as any[]
  const b2c = (b2cRes.data ?? []) as any[]

  const isB2BWon = (l: any) => l.pipeline_stage === 'onboarded'
  const isB2CWon = (l: any) => ['booked', 'completed'].includes(l.pipeline_stage)

  // Overview
  const overview: SalesOverview = {
    totalLeads: b2b.length + b2c.length,
    wonCount: b2b.filter(isB2BWon).length + b2c.filter(isB2CWon).length,
    totalRevenue:
      b2b.filter(isB2BWon).reduce((sum, l) => sum + Number(l.deal_value ?? 0), 0) +
      b2c.filter(isB2CWon).reduce((sum, l) => sum + Number(l.booking_amount ?? 0), 0),
    newThisWeek:
      b2b.filter((l) => l.created_at && toLocalDateStr(new Date(l.created_at)) >= weekStart).length +
      b2c.filter((l) => l.created_at && toLocalDateStr(new Date(l.created_at)) >= weekStart).length,
  }

  // Leaderboard — grouped by assignee across both lead types
  const byRep = new Map<string, SalesLeaderboardEntry>()
  const bumpRep = (l: any, won: boolean, revenue: number) => {
    if (!l.assigned_to || !l.assignee) return
    const entry = byRep.get(l.assigned_to) ?? {
      profileId: l.assigned_to, fullName: l.assignee.full_name, avatarUrl: l.assignee.avatar_url, wonCount: 0, revenue: 0,
    }
    if (won) { entry.wonCount++; entry.revenue += revenue }
    byRep.set(l.assigned_to, entry)
  }
  b2b.forEach((l) => bumpRep(l, isB2BWon(l), Number(l.deal_value ?? 0)))
  b2c.forEach((l) => bumpRep(l, isB2CWon(l), Number(l.booking_amount ?? 0)))
  const leaderboard = Array.from(byRep.values())
    .sort((a, b) => b.revenue - a.revenue || b.wonCount - a.wonCount)
    .slice(0, limit.leaderboard)

  // City breakdown — lead count across both types. Some rows have no
  // `city_id` (only B2C carries a `preferred_city` text fallback; B2B has
  // no city text field at all) — those are bucketed as "Unassigned" rather
  // than silently dropped, so this total always reconciles with the
  // KPI card's totalLeads count.
  const byCityLabel = new Map<string, SalesCityBreakdownEntry>()
  const bumpCity = (label: string) => {
    const entry = byCityLabel.get(label) ?? { cityName: label, leadCount: 0 }
    entry.leadCount++
    byCityLabel.set(label, entry)
  }
  b2b.forEach((l) => bumpCity(l.city?.name ?? 'Unassigned'))
  b2c.forEach((l) => bumpCity(l.city?.name ?? l.preferred_city ?? 'Unassigned'))
  const cityBreakdown = Array.from(byCityLabel.values()).sort((a, b) => b.leadCount - a.leadCount)

  // Recent leads — merged, newest first
  const recentLeads: RecentLeadEntry[] = [
    ...b2b.map((l): RecentLeadEntry => ({
      id: l.id, type: 'b2b', name: l.venue_name ?? 'Unnamed venue', cityName: l.city?.name ?? null,
      stage: l.pipeline_stage ?? 'prospect', assigneeName: l.assignee?.full_name ?? null, createdAt: l.created_at,
    })),
    ...b2c.map((l): RecentLeadEntry => ({
      id: l.id, type: 'b2c', name: l.customer_name, cityName: l.city?.name ?? null,
      stage: l.pipeline_stage, assigneeName: l.assignee?.full_name ?? null, createdAt: l.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit.recent)

  return { overview, leaderboard, cityBreakdown, recentLeads }
}
