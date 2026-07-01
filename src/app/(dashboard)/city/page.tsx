'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth.provider'
import { useVenues, useVenueStats } from '@/features/crm/hooks/use-venues'
import { StatCard } from '@/components/shared/stat-card'
import { SectionHeader } from '@/components/shared/section-header'
import { VenueStatusBadge } from '@/features/crm/components/venue-status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2, CheckCircle, Clock, Search, MapPin } from 'lucide-react'

export default function CityDashboard() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const userCity = user?.profile.city ?? undefined

  const { data: venues, isLoading } = useVenues({ city: userCity, search: search || undefined })
  const { data: stats } = useVenueStats()

  const onboarded = stats?.onboarded ?? 0
  const negotiating = stats?.negotiating ?? 0
  const prospects = stats?.prospect ?? 0

  return (
    <div className="space-y-8 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">City Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1 flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {userCity ? `Showing venues in ${userCity}` : 'All cities'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Onboarded Venues" value={onboarded}
          icon={CheckCircle} iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950" />
        <StatCard label="In Negotiation" value={negotiating}
          icon={Clock} iconColor="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950" />
        <StatCard label="Prospects" value={prospects}
          icon={Building2} iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950" />
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