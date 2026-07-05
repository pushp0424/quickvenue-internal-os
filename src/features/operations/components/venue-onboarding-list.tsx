'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { isCityScoped } from '@/lib/permissions'
import { useOperationsVenues, useUpdateVenueOperations } from '@/features/operations/hooks/use-operations'
import { useCities } from '@/features/b2b/hooks/use-b2b-leads'
import { VenueStatusBadge } from '@/features/crm/components/venue-status-badge'
import { OnboardingChecklist, OnboardingChecklistVenue } from '@/features/operations/components/onboarding-checklist'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Search, Building2, AlertCircle } from 'lucide-react'
import { VenueStatus } from '@/types/database.types'
import { cn } from '@/lib/utils'

const STATUSES: VenueStatus[] = ['prospect', 'contacted', 'negotiating', 'onboarded', 'inactive']

function isAgreementExpiring(dateStr: string | null) {
  if (!dateStr) return false
  const expiry = new Date(dateStr)
  const in30Days = new Date(Date.now() + 30 * 86400000)
  return expiry <= in30Days
}

export function VenueOnboardingList() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<VenueStatus | 'all'>('all')

  const scoped = isCityScoped(user?.roles ?? [])
  const cityId = scoped ? (user?.profile.city_id ?? undefined) : (cityFilter !== 'all' ? cityFilter : undefined)

  const { data: venues, isLoading } = useOperationsVenues({
    cityId,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: search || undefined,
  })
  const { data: cities } = useCities()
  const updateVenue = useUpdateVenueOperations()

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by venue or owner name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {!scoped && (
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="All cities" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {(cities ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as VenueStatus | 'all')}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        {venues?.length ?? 0} venue{(venues?.length ?? 0) !== 1 ? 's' : ''}
      </p>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : !venues || venues.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No venues found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {venues.map((venue) => {
            const expiring = isAgreementExpiring(venue.agreement_expiry)
            return (
              <Card key={venue.id}>
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 md:items-center">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-[#0244C6]/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-[#0244C6]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold truncate">{venue.name}</p>
                        <VenueStatusBadge status={venue.status} />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {venue.area && `${venue.area} · `}
                        {venue.city_ref?.name ?? venue.city}
                        {venue.owner_name && ` · ${venue.owner_name}`}
                      </p>
                      {venue.agreement_expiry && (
                        <p className={cn('text-xs mt-1 flex items-center gap-1', expiring ? 'text-red-500 font-medium' : 'text-muted-foreground')}>
                          {expiring && <AlertCircle className="h-3 w-3" />}
                          Agreement expires {new Date(venue.agreement_expiry).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="md:w-[240px] shrink-0">
                    <OnboardingChecklist
                      venue={venue as OnboardingChecklistVenue}
                      disabled={updateVenue.isPending}
                      onToggle={(field, value) => updateVenue.mutate({ id: venue.id, input: { [field]: value } })}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
