'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { isCityScoped } from '@/lib/permissions'
import { exportToCSV } from '@/lib/csv-export'
import { useB2CLeads } from '@/features/b2c/hooks/use-b2c-leads'
import { useCities } from '@/features/b2b/hooks/use-b2b-leads'
import { useTeamMembers } from '@/features/team/hooks/use-team'
import { B2C_STAGES, STAGE_CONFIG, B2CStage } from '@/features/b2c/components/b2c-stage-badge'
import { B2CLeadCard, B2CLeadCardData } from '@/features/b2c/components/b2c-lead-card'
import { B2CKanbanBoard } from '@/features/b2c/components/b2c-kanban-board'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Search, Users, LayoutGrid, List, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

export function B2CCrmBoard() {
  const { user } = useAuth()
  const [stageFilter, setStageFilter] = useState<B2CStage | 'all'>('all')
  const [cityFilter, setCityFilter] = useState('all')
  const [assignedToFilter, setAssignedToFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban')

  const scoped = isCityScoped(user?.roles ?? [])
  const cityId = scoped ? (user?.profile.city_id ?? undefined) : (cityFilter !== 'all' ? cityFilter : undefined)

  const { data: leads, isLoading } = useB2CLeads({
    cityId,
    stage: stageFilter !== 'all' ? stageFilter : undefined,
    assignedTo: assignedToFilter !== 'all' ? assignedToFilter : undefined,
    search: search || undefined,
  })

  const { data: cities } = useCities()
  const { data: teamMembers } = useTeamMembers()

  function handleExport() {
    if (!leads || leads.length === 0) return
    exportToCSV(
      leads,
      [
        { key: 'customer_name', label: 'Customer Name' },
        { key: 'customer_phone', label: 'Phone' },
        { key: 'customer_email', label: 'Email' },
        { key: 'event_type', label: 'Event Type' },
        { key: 'event_date', label: 'Event Date' },
        { key: 'guest_count', label: 'Guests' },
        { key: 'budget_min', label: 'Budget Min' },
        { key: 'budget_max', label: 'Budget Max' },
        { key: 'pipeline_stage', label: 'Stage' },
        { key: 'booking_amount', label: 'Booking Amount' },
        { key: 'follow_up_date', label: 'Follow-up Date' },
      ],
      `b2c-leads-${new Date().toISOString().slice(0, 10)}.csv`
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={stageFilter} onValueChange={(v) => setStageFilter(v as B2CStage | 'all')}>
          <SelectTrigger className="w-full lg:w-[160px]">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {B2C_STAGES.map((s) => (
              <SelectItem key={s} value={s}>{STAGE_CONFIG[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {!scoped && (
          <Select value={cityFilter} onValueChange={setCityFilter}>
            <SelectTrigger className="w-full lg:w-[140px]">
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {(cities ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={assignedToFilter} onValueChange={setAssignedToFilter}>
          <SelectTrigger className="w-full lg:w-[160px]">
            <SelectValue placeholder="Assigned to" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Anyone</SelectItem>
            {(teamMembers ?? []).map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex rounded-lg border p-0.5">
            <button
              onClick={() => setViewMode('kanban')}
              className={cn('p-1.5 rounded-md transition-colors', viewMode === 'kanban' ? 'bg-[#0244C6] text-white' : 'text-muted-foreground hover:bg-muted')}
              title="Kanban view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('p-1.5 rounded-md transition-colors', viewMode === 'list' ? 'bg-[#0244C6] text-white' : 'text-muted-foreground hover:bg-muted')}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button variant="outline" size="icon" onClick={handleExport} title="Export CSV" disabled={!leads || leads.length === 0}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {leads?.length ?? 0} lead{(leads?.length ?? 0) !== 1 ? 's' : ''}
      </p>

      {/* Board */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      ) : !leads || leads.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No B2C leads found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search ? 'Try a different search' : 'Add your first lead to get started'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'kanban' ? (
        <B2CKanbanBoard leads={leads as B2CLeadCardData[]} />
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {(leads as B2CLeadCardData[]).map((lead) => (
              <B2CLeadCard key={lead.id} lead={lead} variant="row" />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
