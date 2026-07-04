'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/auth-provider'
import { isCityScoped } from '@/lib/permissions'
import { useB2BLeads, useUpdateB2BLeadStage } from '@/features/b2b/hooks/use-b2b-leads'
import { B2BStageBadge, B2B_STAGES, STAGE_CONFIG, B2BStage } from '@/features/b2b/components/b2b-stage-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Search, Building2, Phone } from 'lucide-react'

interface B2BLeadRow {
  id: string
  venue_name: string | null
  venue_area: string | null
  venue_category: string | null
  owner_name: string | null
  owner_phone: string | null
  pipeline_stage: string | null
}

interface Props {
  assignedToMe?: boolean
}

export function B2BLeadsTable({ assignedToMe }: Props = {}) {
  const { user } = useAuth()
  const [stageFilter, setStageFilter] = useState<B2BStage | 'all'>('all')
  const [search, setSearch] = useState('')

  const scoped = !assignedToMe && isCityScoped(user?.roles ?? [])
  const cityId = scoped ? (user?.profile.city_id ?? undefined) : undefined

  const { data: leads, isLoading } = useB2BLeads({
    cityId,
    assignedTo: assignedToMe ? user?.profile.id : undefined,
    stage: stageFilter !== 'all' ? stageFilter : undefined,
    search: search || undefined,
  }, { enabled: !assignedToMe || !!user })

  const updateStage = useUpdateB2BLeadStage()

  return (
    <div className="space-y-4">
      {/* Filters */}
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
        <Select
          value={stageFilter}
          onValueChange={(v) => setStageFilter(v as B2BStage | 'all')}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {B2B_STAGES.map((s) => (
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
              <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No B2B leads found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {search ? 'Try a different search' : 'Add your first lead to get started'}
              </p>
            </div>
          ) : (
            (leads as B2BLeadRow[]).map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-4 px-6 py-4 border-b last:border-0 hover:bg-muted/40 transition-colors"
              >
                <Link href={`/b2b/${lead.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-[#0244C6]/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-4 w-4 text-[#0244C6]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{lead.venue_name ?? 'Unnamed Venue'}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {lead.venue_area && `${lead.venue_area} · `}
                      {lead.venue_category && `${String(lead.venue_category).replace(/_/g, ' ')} · `}
                      {lead.owner_name ?? 'No owner listed'}
                    </p>
                  </div>

                  {lead.owner_phone && (
                    <div className="hidden md:flex items-center gap-1.5 shrink-0 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {lead.owner_phone}
                    </div>
                  )}
                </Link>

                <div className="shrink-0">
                  <Select
                    value={lead.pipeline_stage ?? undefined}
                    onValueChange={(v) => updateStage.mutate({ id: lead.id, stage: v })}
                  >
                    <SelectTrigger className="h-7 w-[140px] border-0 shadow-none p-0 [&>svg]:hidden">
                      <B2BStageBadge stage={lead.pipeline_stage} />
                    </SelectTrigger>
                    <SelectContent>
                      {B2B_STAGES.map((s) => (
                        <SelectItem key={s} value={s}>{STAGE_CONFIG[s].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
