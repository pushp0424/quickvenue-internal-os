/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@/services/supabase/client'
import { toLocalDateStr, getMonthStart } from '@/lib/utils'

export interface CityOverview {
  cityId: string
  cityName: string
  state: string | null
  launchDate: string | null
  venues: { total: number; onboarded: number; negotiating: number; prospect: number }
  leads: { b2b: number; b2c: number }
  revenueThisMonth: number
  teamSize: number
}

// One batch fetch + client-side rollup (same shape as finance-services.ts's
// getCityRevenueBreakdown) rather than a query per city — the org has a
// handful of cities, so this stays cheap while keeping a single code path
// for both the single-city view and the founder/admin all-cities comparison.
async function getCitiesRollup(): Promise<CityOverview[]> {
  const supabase = createClient()
  const monthStart = toLocalDateStr(getMonthStart(new Date()))

  const [citiesRes, venuesRes, b2bRes, b2cRes, profilesRes] = await Promise.all([
    supabase.from('cities' as any).select('id, name, state, launch_date').eq('is_active', true),
    supabase.from('venues' as any).select('city_id, city, status').eq('is_active', true),
    supabase.from('leads' as any).select('city_id').eq('lead_type', 'b2b'),
    supabase.from('customer_leads' as any).select('city_id, preferred_city, pipeline_stage, booking_amount, event_date, created_at'),
    supabase.from('profiles' as any).select('city_id, city').eq('is_active', true),
  ])
  if (citiesRes.error) throw citiesRes.error
  if (venuesRes.error) throw venuesRes.error
  if (b2bRes.error) throw b2bRes.error
  if (b2cRes.error) throw b2cRes.error
  if (profilesRes.error) throw profilesRes.error

  const byCity = new Map<string, CityOverview>()
  const nameToId = new Map<string, string>()
  ;((citiesRes.data ?? []) as any[]).forEach((c) => {
    byCity.set(c.id, {
      cityId: c.id,
      cityName: c.name,
      state: c.state,
      launchDate: c.launch_date,
      venues: { total: 0, onboarded: 0, negotiating: 0, prospect: 0 },
      leads: { b2b: 0, b2c: 0 },
      revenueThisMonth: 0,
      teamSize: 0,
    })
    nameToId.set(String(c.name).toLowerCase().trim(), c.id)
  })

  // Several tables still carry a legacy free-text city name alongside (or
  // instead of) the `city_id` FK — in this app's real data, `venues.city_id`
  // is null for every existing row, so a city_id-only rollup would silently
  // show zero venues everywhere. Fall back to matching the text name.
  const resolveCityId = (cityId: string | null, cityName: string | null) =>
    cityId ?? (cityName ? nameToId.get(cityName.toLowerCase().trim()) : undefined)

  ;((venuesRes.data ?? []) as any[]).forEach((v) => {
    const entry = byCity.get(resolveCityId(v.city_id, v.city) ?? '')
    if (!entry) return
    entry.venues.total++
    if (v.status === 'onboarded') entry.venues.onboarded++
    else if (v.status === 'negotiating') entry.venues.negotiating++
    else if (v.status === 'prospect') entry.venues.prospect++
  })

  ;((b2bRes.data ?? []) as any[]).forEach((l) => {
    const entry = l.city_id ? byCity.get(l.city_id) : undefined
    if (entry) entry.leads.b2b++
  })

  ;((b2cRes.data ?? []) as any[]).forEach((l) => {
    const entry = byCity.get(resolveCityId(l.city_id, l.preferred_city) ?? '')
    if (!entry) return
    entry.leads.b2c++
    if (['booked', 'completed'].includes(l.pipeline_stage)) {
      const dateStr = toLocalDateStr(new Date(l.event_date ?? l.created_at ?? Date.now()))
      if (dateStr >= monthStart) entry.revenueThisMonth += Number(l.booking_amount ?? 0)
    }
  })

  ;((profilesRes.data ?? []) as any[]).forEach((p) => {
    const entry = byCity.get(resolveCityId(p.city_id, p.city) ?? '')
    if (entry) entry.teamSize++
  })

  return Array.from(byCity.values()).sort((a, b) => b.venues.total - a.venues.total)
}

export async function getAllCitiesOverview(): Promise<CityOverview[]> {
  return getCitiesRollup()
}

export async function getCityOverview(cityId: string): Promise<CityOverview | null> {
  const all = await getCitiesRollup()
  return all.find((c) => c.cityId === cityId) ?? null
}
