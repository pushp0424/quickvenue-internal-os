'use client'

import { useMemo } from 'react'
import { useAuth } from '@/context/auth-provider'
import { isCityScoped } from '@/lib/permissions'
import { useOperationsStats, useOperationsVenues } from '@/features/operations/hooks/use-operations'
import { StatCard } from '@/components/shared/stat-card'
import { SectionHeader } from '@/components/shared/section-header'
import { VenueOnboardingList } from '@/features/operations/components/venue-onboarding-list'
import { VendorList } from '@/features/operations/components/vendor-list'
import { AddVendorModal } from '@/features/operations/components/add-vendor-modal'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, CheckCircle2, Clock, AlertTriangle, MapPin } from 'lucide-react'

export default function OperationsDashboard() {
  const { user } = useAuth()
  const scoped = isCityScoped(user?.roles ?? [])

  const { data: stats, isLoading: statsLoading } = useOperationsStats()
  const { data: allVenues, isLoading: venuesLoading } = useOperationsVenues()

  const cityBreakdown = useMemo(() => {
    const map = new Map<string, { total: number; onboarded: number }>()
    ;(allVenues ?? []).forEach((v) => {
      const cityName = v.city_ref?.name ?? v.city ?? 'Unknown'
      const entry = map.get(cityName) ?? { total: 0, onboarded: 0 }
      entry.total++
      if (v.status === 'onboarded') entry.onboarded++
      map.set(cityName, entry)
    })
    return Array.from(map.entries()).sort((a, b) => b[1].total - a[1].total)
  }, [allVenues])

  return (
    <div className="space-y-8 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Operations</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {scoped ? 'Venue onboarding and vendor management for your city' : 'Venue onboarding and vendor management across all cities'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Onboarded This Month" value={stats?.onboardedThisMonth ?? 0} icon={CheckCircle2}
          iconColor="text-emerald-600" iconBg="bg-emerald-50 dark:bg-emerald-950" loading={statsLoading} />
        <StatCard label="Pending Onboarding" value={stats?.pendingOnboarding ?? 0} icon={Clock}
          iconColor="text-amber-600" iconBg="bg-amber-50 dark:bg-amber-950" loading={statsLoading} />
        <StatCard label="Agreements Expiring (30d)" value={stats?.expiringAgreements ?? 0} icon={AlertTriangle}
          iconColor="text-red-600" iconBg="bg-red-50 dark:bg-red-950" loading={statsLoading} />
        <StatCard label="Total Active Venues" value={stats?.total ?? 0} icon={Building2}
          iconColor="text-blue-600" iconBg="bg-blue-50 dark:bg-blue-950" loading={statsLoading} />
      </div>

      {/* City-wise overview */}
      {!scoped && (
        <div>
          <SectionHeader title="City-wise Overview" subtitle="Venue onboarding progress by city" />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {venuesLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : cityBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No venues yet.</p>
            ) : (
              cityBreakdown.map(([city, counts]) => (
                <Card key={city}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <MapPin className="h-3.5 w-3.5 text-[#0244C6]" />
                      {city}
                    </div>
                    <p className="text-2xl font-bold tracking-tight mt-1">{counts.onboarded}<span className="text-sm text-muted-foreground font-normal">/{counts.total} onboarded</span></p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* Venue onboarding tracker */}
      <div>
        <SectionHeader title="Venue Onboarding Tracker" subtitle="Track every venue through the onboarding checklist" />
        <div className="mt-4">
          <VenueOnboardingList />
        </div>
      </div>

      {/* Vendor management */}
      <div>
        <SectionHeader
          title="Vendor Management"
          subtitle="Catering, decor, and other event vendors"
          action={<AddVendorModal />}
        />
        <div className="mt-4">
          <VendorList />
        </div>
      </div>
    </div>
  )
}
