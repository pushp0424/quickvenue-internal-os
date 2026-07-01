'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin } from 'lucide-react'

interface Props {
  data: Record<string, number>
  loading: boolean
}

export function CityBreakdownCard({ data, loading }: Props) {
  const total = Object.values(data).reduce((a, b) => a + b, 0)
  const sorted = Object.entries(data).sort((a, b) => b[1] - a[1])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Team by City</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))
        ) : total === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No city data yet — assign cities to team members
          </p>
        ) : (
          sorted.map(([city, count]) => (
            <div
              key={city}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#0244C6]" />
                <span className="text-sm font-medium">{city}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{count} members</span>
                <span className="text-xs font-bold text-[#0244C6]">
                  {Math.round((count / total) * 100)}%
                </span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}