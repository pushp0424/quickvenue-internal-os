'use client'

import { useMemo, useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { isCityScoped } from '@/lib/permissions'
import { useVenues } from '@/features/crm/hooks/use-venues'
import { useCityOverview, useAllCitiesOverview } from '@/features/city/hooks/use-city'
import { StatCard } from '@/components/shared/stat-card'
import { SectionHeader } from '@/components/shared/section-header'
import { BreakdownBarCard } from '@/components/shared/breakdown-bar-card'
import { VenueStatusBadge } from '@/features/crm/components/venue-status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building2, CheckCircle, Clock, Search, MapPin, Users, Wallet, TrendingUp,
} from 'lucide-react'

function inr(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

export default function CityDashboard() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const userCity = user?.profile.city ?? undefined
  const cityId = user?.profile.city_id ?? undefined
  const scoped = isCityScoped(user?.roles ?? [])

  const { data: venues, isLoading } = useVenues({ city: userCity, search: search || undefined })
  const { data: allCities, isLoading: allCitiesLoading } = useAllCitiesOverview()

  // Some profiles only have the legacy `city` text field set, not `city_id`
  // — resolve by name against the cities list already fetched above so a
  // city_lead whose own profile lacks city_id still sees their city's data.
  const effectiveCityId = cityId ?? allCities?.find((c) => c.cityName.toLowerCase() === userCity?.toLowerCase())?.cityId
  const { data: cityOverview, isLoading: overviewLoading } = useCityOverview(scoped ? effectiveCityId : undefined)

  const orgTotals = useMemo(() => {
    const list = allCities ?? []
    return list.reduce(
      (acc, c) => ({
        venues: acc.venues + c.venues.total,
        leads: acc.leads + c.leads.b2b + c.leads.b2c,
        revenue: acc.revenue + c.revenueThisMonth,
        team: acc.team + c.teamSize,
      }),
      { venues: 0, leads: 0, revenue: 0, team: 0 }
    )
  }, [allCities])

  const overviewStatsLoading = scoped ? overviewLoading : allCitiesLoading

  return (
    <div className="space-y-8 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">City Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {scoped
            ? (cityOverview ? `${cityOverview.cityName}${cityOverview.state ? `, ${cityOverview.state}` : ''}` : (userCity ? `Showing venues in ${userCity}` : 'Your city'))
            : 'All cities — organization overview'}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {scoped ? (
          <>
            <StatCard label="Onboarded Venues" value={cityOverview?.venues.onboarded ?? 0}
              icon={CheckCircle} iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950" loading={overviewStatsLoading} />
            <StatCard label="In Negotiation" value={cityOverview?.venues.negotiating ?? 0}
              icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950" loading={overviewStatsLoading} />
            <StatCard label="Leads (B2B + B2C)" value={(cityOverview?.leads.b2b ?? 0) + (cityOverview?.leads.b2c ?? 0)}
              icon={TrendingUp} iconColor="text-purple-600" iconBg="bg-purple-50 dark:bg-purple-950" loading={overviewStatsLoading} />
            <StatCard label="Revenue (Month)" value={inr(cityOverview?.revenueThisMonth ?? 0)}
              icon={Wallet} iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950" loading={overviewStatsLoading} />
          </>
        ) : (
          <>
            <StatCard label="Total Venues" value={orgTotals.venues}
              icon={Building2} iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950" loading={overviewStatsLoading} />
            <StatCard label="Total Leads" value={orgTotals.leads}
              icon={TrendingUp} iconColor="text-purple-600" iconBg="bg-purple-50 dark:bg-purple-950" loading={overviewStatsLoading} />
            <StatCard label="Revenue (Month)" value={inr(orgTotals.revenue)}
              icon={Wallet} iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950" loading={overviewStatsLoading} />
            <StatCard label="Team Across Cities" value={orgTotals.team}
              icon={Users} iconColor="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950" loading={overviewStatsLoading} />
          </>
        )}
      </div>

      {/* City venue-status breakdown (scoped) or all-cities comparison (founder/admin) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {scoped ? (
          <BreakdownBarCard
            title="Venue Status Mix"
            subtitle={cityOverview?.cityName}
            loading={overviewStatsLoading}
            data={[
              { label: 'Onboarded', value: cityOverview?.venues.onboarded ?? 0, colorClass: 'bg-emerald-500' },
              { label: 'In Negotiation', value: cityOverview?.venues.negotiating ?? 0, colorClass: 'bg-amber-500' },
              { label: 'Prospects', value: cityOverview?.venues.prospect ?? 0, colorClass: 'bg-blue-500' },
            ]}
          />
        ) : (
          <>
            <BreakdownBarCard
              title="Venues by City"
              loading={allCitiesLoading}
              data={(allCities ?? []).map((c) => ({ label: c.cityName, value: c.venues.total }))}
            />
            <BreakdownBarCard
              title="Revenue by City (This Month)"
              loading={allCitiesLoading}
              formatValue={inr}
              data={(allCities ?? []).map((c) => ({ label: c.cityName, value: c.revenueThisMonth }))}
            />
          </>
        )}
      </div>

      {/* Venues Table */}
      <div>
        <SectionHeader
          title="Venues"
          subtitle={`${venues?.length ?? 0} venues found`}
        />
        <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, owner, or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4 border-b last:border-0">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))
              ) : venues && venues.length > 0 ? (
                venues.map((venue) => (
                  <div
                    key={venue.id}
                    className="flex items-center gap-4 px-6 py-4 border-b last:border-0 hover:bg-muted/40 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-[#0244C6]/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-[#0244C6]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{venue.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {venue.area && `${venue.area} · `}
                        {venue.category.replace(/_/g, ' ')}
                        {venue.owner_name && ` · ${venue.owner_name}`}
                      </p>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                      <VenueStatusBadge status={venue.status} />
                      {venue.price_per_day && (
                        <span className="text-xs text-muted-foreground">
                          ₹{venue.price_per_day.toLocaleString('en-IN')}/day
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center">
                  <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">No venues found</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {search ? 'Try a different search term' : 'Add your first venue to get started'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
