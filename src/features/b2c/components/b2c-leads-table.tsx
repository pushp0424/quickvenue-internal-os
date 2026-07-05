'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { isCityScoped } from '@/lib/permissions'
import { useB2CLeads } from '@/features/b2c/hooks/use-b2c-leads'
import { B2C_STAGES, STAGE_CONFIG, B2CStage } from '@/features/b2c/components/b2c-stage-badge'
import { B2CLeadCard, B2CLeadCardData } from '@/features/b2c/components/b2c-lead-card'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Search, Users } from 'lucide-react'

interface Props {
  assignedToMe?: boolean
}

export function B2CLeadsTable({ assignedToMe }: Props = {}) {
  const { user } = useAuth()
  const [stageFilter, setStageFilter] = useState<B2CStage | 'all'>('all')
  const [search, setSearch] = useState('')

  const scoped = !assignedToMe && isCityScoped(user?.roles ?? [])
  const cityId = scoped ? (user?.profile.city_id ?? undefined) : undefined

  const { data: leads, isLoading } = useB2CLeads({
    cityId,
    assignedTo: assignedToMe ? user?.profile.id : undefined,
    stage: stageFilter !== 'all' ? stageFilter : undefined,
    search: search || undefined,
  }, { enabled: !assignedToMe || !!user })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={stageFilter}
          onValueChange={(v) => setStageFilter(v as B2CStage | 'all')}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {B2C_STAGES.map((s) => (
              <SelectItem key={s} value={s}>{STAGE_CONFIG[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        {leads?.length ?? 0} lead{(leads?.length ?? 0) !== 1 ? 's' : ''}
      </p>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b last:border-0">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-6 w-24" />
              </div>
            ))
          ) : !leads || leads.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No B2C leads found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {search ? 'Try a different search' : 'Add your first lead to get started'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {(leads as B2CLeadCardData[]).map((lead) => (
                <B2CLeadCard key={lead.id} lead={lead} variant="row" />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
