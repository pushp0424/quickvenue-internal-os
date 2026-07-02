'use client'

import { useLeadStats } from '@/features/crm/hooks/use-leads'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp } from 'lucide-react'

const PIPELINE_STAGES = [
  { key: 'new', label: 'New', color: 'bg-sky-500' },
  { key: 'contacted', label: 'Contacted', color: 'bg-blue-500' },
  { key: 'interested', label: 'Interested', color: 'bg-violet-500' },
  { key: 'negotiating', label: 'Negotiating', color: 'bg-amber-500' },
  { key: 'won', label: 'Won', color: 'bg-emerald-500' },
  { key: 'lost', label: 'Lost', color: 'bg-red-500' },
  { key: 'on_hold', label: 'On Hold', color: 'bg-gray-400' },
]

export function LeadPipeline() {
  const { data: stats, isLoading } = useLeadStats()

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const total = stats?.total ?? 0
  const byStatus = stats?.byStatus ?? {}
  const wonCount = byStatus['won'] ?? 0
  const winRate = total > 0 ? Math.round((wonCount / total) * 100) : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Lead Pipeline</CardTitle>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            {winRate}% win rate
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {PIPELINE_STAGES.map(({ key, label, color }) => {
          const count = byStatus[key] ?? 0
          const pct = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold tabular-nums">{count}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
        <div className="pt-2 border-t text-xs text-muted-foreground">
          {total} total leads
        </div>
      </CardContent>
    </Card>
  )
}