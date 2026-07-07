/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase/client'
import { createNotification } from '@/services/supabase/notifications-services'

async function getSession() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

const GOAL_SELECT = '*, owner:profiles!goals_owner_id_fkey(id, full_name, avatar_url)'

export type GoalScopeType = 'personal' | 'team' | 'department' | 'city'

export interface GoalOwnerSummary {
  id: string
  full_name: string
  avatar_url: string | null
}

export interface Goal {
  id: string
  title: string
  target_value: number
  unit: string | null
  current_value: number
  scope_type: GoalScopeType
  scope_value: string | null
  owner_id: string | null
  owner: GoalOwnerSummary | null
  period_start: string
  period_end: string
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface GoalInput {
  title: string
  targetValue: number
  unit?: string
  scopeType: GoalScopeType
  scopeValue?: string
  periodStart: string
  periodEnd: string
}

export async function getGoals(periodStart: string): Promise<Goal[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('goals' as any)
    .select(GOAL_SELECT)
    .eq('period_start', periodStart)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as any
}

export async function createGoal(input: GoalInput) {
  const supabase = createClient()
  const session = await getSession()
  const { data, error } = await supabase
    .from('goals' as any)
    .insert({
      title: input.title,
      target_value: input.targetValue,
      unit: input.unit ?? null,
      scope_type: input.scopeType,
      scope_value: input.scopeValue ?? null,
      owner_id: session?.user.id,
      period_start: input.periodStart,
      period_end: input.periodEnd,
    })
    .select(GOAL_SELECT)
    .single()
  if (error) throw error
  return data as any
}

export async function updateGoalProgress(id: string, newValue: number) {
  const supabase = createClient()
  const { data: existing, error: fetchError } = await supabase
    .from('goals' as any)
    .select('*')
    .eq('id', id)
    .single()
  if (fetchError) throw fetchError

  const before = existing as any
  const justCompleted = before.current_value < before.target_value && newValue >= before.target_value

  const { data, error } = await supabase
    .from('goals' as any)
    .update({
      current_value: newValue,
      completed_at: justCompleted ? new Date().toISOString() : before.completed_at,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(GOAL_SELECT)
    .single()
  if (error) throw error

  if (justCompleted && before.owner_id) {
    await createNotification({
      recipientId: before.owner_id,
      type: 'goal_completed',
      title: 'Goal completed!',
      body: before.title,
      link: '/goals',
    })
  }

  return { goal: data as any, justCompleted }
}

export async function deleteGoal(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('goals' as any).delete().eq('id', id)
  if (error) throw error
}

export async function getMyHeadedDepartments(userId: string): Promise<{ id: string; name: string }[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('departments' as any)
    .select('id, name')
    .eq('head_id', userId)
  if (error) throw error
  return (data ?? []) as any
}

// =========================================
// LEADERBOARD — personal goals only, averaged completion % per owner
// =========================================
export interface LeaderboardEntry {
  ownerId: string
  fullName: string
  avatarUrl: string | null
  avgCompletionPct: number
  goalCount: number
}

export async function getLeaderboard(monthStart: string, monthEnd: string): Promise<LeaderboardEntry[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('goals' as any)
    .select(GOAL_SELECT)
    .eq('scope_type', 'personal')
    .gte('period_start', monthStart)
    .lte('period_start', monthEnd)
  if (error) throw error

  const byOwner = new Map<string, { fullName: string; avatarUrl: string | null; total: number; count: number }>()
  ;((data ?? []) as any[]).forEach((g) => {
    if (!g.owner_id || !g.owner) return
    const pct = g.target_value > 0 ? Math.min(100, (g.current_value / g.target_value) * 100) : 0
    const entry = byOwner.get(g.owner_id) ?? { fullName: g.owner.full_name, avatarUrl: g.owner.avatar_url, total: 0, count: 0 }
    entry.total += pct
    entry.count += 1
    byOwner.set(g.owner_id, entry)
  })

  return Array.from(byOwner.entries())
    .map(([ownerId, e]) => ({
      ownerId,
      fullName: e.fullName,
      avatarUrl: e.avatarUrl,
      avgCompletionPct: Math.round(e.total / e.count),
      goalCount: e.count,
    }))
    .sort((a, b) => b.avgCompletionPct - a.avgCompletionPct)
    .slice(0, 10)
}
