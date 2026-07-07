'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface BreakdownBarDatum {
  label: string
  value: number
  colorClass?: string
  sub?: string
}

interface Props {
  title: string
  subtitle?: string
  data: BreakdownBarDatum[]
  loading?: boolean
  emptyMessage?: string
  formatValue?: (value: number) => string
}

const DEFAULT_COLORS = [
  'bg-[#0244C6]', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500',
  'bg-cyan-500', 'bg-pink-500', 'bg-orange-500', 'bg-indigo-500',
]

// Generic proportional-bar breakdown, reused across City/Sales/Operations
// dashboards — same width-percentage pattern as role-breakdown-card.tsx,
// generalized since three new dashboards need the same visual with
// different data. No chart library is installed in this app; this is the
// established zero-dependency way to show a comparative breakdown.
export function BreakdownBarCard({
  title, subtitle, data, loading, emptyMessage = 'No data yet', formatValue,
}: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const sorted = [...data].sort((a, b) => b.value - a.value)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))
        ) : total === 0 || sorted.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">{emptyMessage}</p>
        ) : (
          sorted.map((d, i) => (
            <div key={d.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs gap-2">
                <span className="text-muted-foreground truncate">{d.label}{d.sub && ` · ${d.sub}`}</span>
                <span className="font-semibold tabular-nums shrink-0">
                  {formatValue ? formatValue(d.value) : d.value}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', d.colorClass ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length])}
                  style={{ width: `${total > 0 ? (d.value / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
