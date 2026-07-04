'use client'

import { useB2BStats } from '@/features/b2b/hooks/use-b2b-leads'
import { B2B_STAGES, STAGE_CONFIG } from '@/features/b2b/components/b2b-stage-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function B2BStageStatsBar() {
  const { data: stats, isLoading } = useB2BStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {B2B_STAGES.map((stage) => (
        <div key={stage} className="rounded-lg border bg-card px-3 py-2.5">
          <p className="text-xs text-muted-foreground truncate">{STAGE_CONFIG[stage].label}</p>
          <p className={cn('text-xl font-bold tracking-tight mt-0.5')}>{stats?.[stage] ?? 0}</p>
        </div>
      ))}
    </div>
  )
}
