'use client'

import { useState } from 'react'
import { useLeads } from '@/features/crm/hooks/use-leads'
import { LeadStatusBadge } from '@/features/crm/components/lead-status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Search, TrendingUp, Calendar, AlertCircle } from 'lucide-react'
import { LeadStatus } from '@/types/database.types'
import { cn } from '@/lib/utils'

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
  high:   { label: 'High',   className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  low:    { label: 'Low',    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short',
  })
}

function isOverdue(dateStr: string | null) {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

export function LeadsTable() {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [search, setSearch] = useState('')

  const { data: leads, isLoading } = useLeads(
    statusFilter !== 'all' ? { status: statusFilter } : undefined
  )

  const filtered = (leads ?? []).filter((l: any) => {
    if (!search) return true
    const venueName = l.venue?.name?.toLowerCase() ?? ''
    const city = l.venue?.city?.toLowerCase() ?? ''
    const assignee = l.assignee?.full_name?.toLowerCase() ?? ''
    const q = search.toLowerCase()
    return venueName.includes(q) || city.includes(q) || assignee.includes(q)
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by venue, city, assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as LeadStatus | 'all')}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="interested">Interested</SelectItem>
            <SelectItem value="negotiating">Negotiating</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} lead{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 border-b last:border-0">
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <TrendingUp className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No leads found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {search ? 'Try a different search' : 'Leads will appear here once added'}
              </p>
            </div>
          ) : (
            filtered.map((lead: any) => {
              const priority = PRIORITY_CONFIG[lead.priority as keyof typeof PRIORITY_CONFIG]
              const overdue = isOverdue(lead.follow_up_date) && !['won', 'lost'].includes(lead.status)

              return (
                <div
                  key={lead.id}
                  className="flex items-start gap-4 px-6 py-4 border-b last:border-0 hover:bg-muted/40 transition-colors"
                >
                  {/* Icon */}
                  <div className="h-9 w-9 rounded-lg bg-[#0244C6]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="h-4 w-4 text-[#0244C6]" />
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate">
                        {lead.venue?.name ?? 'Unknown Venue'}
                      </p>
                      {overdue && (
                        <div className="flex items-center gap-1 text-red-500">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Overdue</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {lead.venue?.city}
                      {lead.venue?.category && ` · ${lead.venue.category.replace(/_/g, ' ')}`}
                      {lead.assignee?.full_name && ` · Assigned to ${lead.assignee.full_name}`}
                    </p>
                    {lead.notes && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">
                        "{lead.notes}"
                      </p>
                    )}
                  </div>

                  {/* Priority */}
                  <div className="hidden sm:block shrink-0">
                    <Badge className={cn('text-[10px] border-0', priority?.className)}>
                      {priority?.label}
                    </Badge>
                  </div>

                  {/* Follow-up date */}
                  {lead.follow_up_date && (
                    <div className="hidden md:flex items-center gap-1 shrink-0">
                      <Calendar className={cn('h-3.5 w-3.5', overdue ? 'text-red-500' : 'text-muted-foreground')} />
                      <span className={cn('text-xs', overdue ? 'text-red-500 font-medium' : 'text-muted-foreground')}>
                        {formatDate(lead.follow_up_date)}
                      </span>
                    </div>
                  )}

                  {/* Status */}
                  <div className="shrink-0">
                    <LeadStatusBadge status={lead.status} />
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}