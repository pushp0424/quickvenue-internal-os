'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'

interface Props {
  data: Record<string, number>
  loading: boolean
}

const ROLE_LABELS: Record<string, string> = {
  founder: 'Founder',
  admin: 'Admin',
  city_lead: 'City Lead',
  sales_executive: 'Sales Executive',
  operations_executive: 'Operations Exec',
  venue_acquisition_executive: 'Venue Acq. Exec',
  developer: 'Developer',
  hr: 'HR',
}

const ROLE_COLORS: Record<string, string> = {
  founder: 'bg-[#D4AF37]',
  admin: 'bg-[#0244C6]',
  city_lead: 'bg-purple-500',
  sales_executive: 'bg-emerald-500',
  operations_executive: 'bg-orange-500',
  venue_acquisition_executive: 'bg-cyan-500',
  developer: 'bg-pink-500',
  hr: 'bg-indigo-500',
}

export function RoleBreakdownCard({ data, loading }: Props) {
  const total = Object.values(data).reduce((a, b) => a + b, 0)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Team by Role</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))
        ) : total === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No role assignments yet
          </p>
        ) : (
          Object.entries(data)
            .sort((a, b) => b[1] - a[1])
            .map(([role, count]) => (
              <div key={role} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {ROLE_LABELS[role] ?? role}
                  </span>
                  <span className="font-semibold tabular-nums">{count}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${ROLE_COLORS[role] ?? 'bg-primary'}`}
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                </div>
              </div>
            ))
        )}
      </CardContent>
    </Card>
  )
}