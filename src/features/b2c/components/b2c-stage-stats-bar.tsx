'use client'

import { useB2CStats } from '@/features/b2c/hooks/use-b2c-leads'
import { B2C_STAGES, STAGE_CONFIG } from '@/features/b2c/components/b2c-stage-badge'
import { Skeleton } from '@/components/ui/skeleton'

export function B2CStageStatsBar() {
  const { data: stats, isLoading } = useB2CStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {B2C_STAGES.map((stage) => (
        <div key={stage} className="rounded-lg border bg-card px-3 py-2.5">
          <p className="text-xs text-muted-foreground truncate">{STAGE_CONFIG[stage].label}</p>
          <p className="text-xl font-bold tracking-tight mt-0.5">{stats?.counts?.[stage] ?? 0}</p>
        </div>
      ))}
    </div>
  )
}
