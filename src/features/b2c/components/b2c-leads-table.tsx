'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/auth-provider'
import { isCityScoped } from '@/lib/permissions'
import { useB2CLeads } from '@/features/b2c/hooks/use-b2c-leads'
import { B2C_STAGES, STAGE_CONFIG, B2CStage } from '@/features/b2c/components/b2c-stage-badge'
import { B2CStageSelect } from '@/features/b2c/components/b2c-stage-select'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Search, Users, Phone, Calendar } from 'lucide-react'

interface B2CLeadRow {
  id: string
  customer_name: string
  customer_phone: string
  event_type: string | null
  event_date: string | null
  guest_count: number | null
  budget_min: number | null
  budget_max: number | null
  booking_amount: number | null
  pipeline_stage: string
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

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
            (leads as B2CLeadRow[]).map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-4 px-6 py-4 border-b last:border-0 hover:bg-muted/40 transition-colors"
              >
                <Link href={`/b2c/${lead.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-[#0244C6]/10 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-[#0244C6]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{lead.customer_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {lead.event_type && `${String(lead.event_type).replace(/_/g, ' ')} · `}
                      {lead.guest_count && `${lead.guest_count} guests · `}
                      {lead.budget_min && lead.budget_max
                        ? `₹${lead.budget_min.toLocaleString('en-IN')}-${lead.budget_max.toLocaleString('en-IN')}`
                        : ''}
                    </p>
                  </div>

                  <div className="hidden md:flex items-center gap-1.5 shrink-0 text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {lead.customer_phone}
                  </div>

                  {lead.event_date && (
                    <div className="hidden lg:flex items-center gap-1.5 shrink-0 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(lead.event_date)}
                    </div>
                  )}

                  {lead.booking_amount != null && lead.booking_amount > 0 && (
                    <div className="hidden sm:block shrink-0 text-xs font-semibold text-emerald-600">
                      ₹{lead.booking_amount.toLocaleString('en-IN')}
                    </div>
                  )}
                </Link>

                <div className="shrink-0">
                  <B2CStageSelect leadId={lead.id} stage={lead.pipeline_stage} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
