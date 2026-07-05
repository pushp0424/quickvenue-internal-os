/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase/client'
import { toLocalDateStr } from '@/lib/utils'

function todayStr() {
  return toLocalDateStr(new Date())
}

function computeIsLate(checkInAt: Date) {
  const hours = checkInAt.getHours()
  const minutes = checkInAt.getMinutes()
  return hours > 10 || (hours === 10 && minutes > 0)
}

async function getPosition(): Promise<{ lat?: number; lng?: number }> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return {}
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve({}),
      { timeout: 5000 }
    )
  })
}

// =========================================
// CHECK-IN / CHECK-OUT
// =========================================
export async function getTodayAttendance(profileId: string): Promise<Record<string, any> | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('attendance' as any)
    .select('*')
    .eq('profile_id', profileId)
    .eq('date', todayStr())
    .maybeSingle()
  if (error) throw error
  return data
}

export async function checkIn(profileId: string, input: { workMode: string; cityId?: string | null }) {
  const supabase = createClient()
  const now = new Date()
  const { lat, lng } = await getPosition()
  const { data, error } = await supabase
    .from('attendance' as any)
    .upsert({
      profile_id: profileId,
      date: todayStr(),
      check_in_at: now.toISOString(),
      check_in_lat: lat ?? null,
      check_in_lng: lng ?? null,
      is_late: computeIsLate(now),
      work_mode: input.workMode,
      city_id: input.cityId ?? null,
    }, { onConflict: 'profile_id,date' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function checkOut(profileId: string) {
  const supabase = createClient()
  const { lat, lng } = await getPosition()
  const { data, error } = await supabase
    .from('attendance' as any)
    .update({
      check_out_at: new Date().toISOString(),
      check_out_lat: lat ?? null,
      check_out_lng: lng ?? null,
    })
    .eq('profile_id', profileId)
    .eq('date', todayStr())
    .select()
    .single()
  if (error) throw error
  return data
}

// =========================================
// PERSONAL CALENDAR
// =========================================
export async function getMyAttendance(profileId: string, monthStart: string, monthEnd: string): Promise<Record<string, any>[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('attendance' as any)
    .select('*')
    .eq('profile_id', profileId)
    .gte('date', monthStart)
    .lte('date', monthEnd)
    .order('date')
  if (error) throw error
  return (data ?? []) as any
}

// =========================================
// TEAM ROSTER (HR / city lead / team lead)
// =========================================
export async function getProfileIdsForTeam(team: string): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('profiles' as any).select('id').eq('team', team)
  if (error) throw error
  return (data ?? []).map((p: any) => p.id)
}

export async function getTeamAttendance(filters: {
  cityId?: string
  profileIds?: string[]
  monthStart: string
  monthEnd: string
}): Promise<Record<string, any>[]> {
  const supabase = createClient()
  let q = supabase
    .from('attendance' as any)
    .select('*, profile:profiles(id, full_name, avatar_url, team, city_id)')
    .gte('date', filters.monthStart)
    .lte('date', filters.monthEnd)
    .order('date', { ascending: false })

  if (filters.cityId) q = q.eq('city_id', filters.cityId)
  if (filters.profileIds) q = q.in('profile_id', filters.profileIds)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as any
}
