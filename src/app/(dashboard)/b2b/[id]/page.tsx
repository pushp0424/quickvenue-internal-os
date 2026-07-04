'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useB2BLead, useUpdateB2BLead } from '@/features/b2b/hooks/use-b2b-lead-detail'
import { useB2BLeadActivities, useLogB2BLeadActivity } from '@/features/b2b/hooks/use-b2b-lead-detail'
import { useUpdateB2BLeadStage } from '@/features/b2b/hooks/use-b2b-leads'
import { B2BStageBadge, B2B_STAGES, STAGE_CONFIG, B2BStage } from '@/features/b2b/components/b2b-stage-badge'
import { ActivityTimeline } from '@/components/shared/activity-timeline'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger,
} from '@/components/ui/select'
import { ArrowLeft, Building2, Phone, Mail, MapPin, IndianRupee, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface B2BLeadFields {
  next_action: string | null
  deal_value: number | null
  visit_date: string | null
  notes: string | null
}

function B2BLeadDetailsForm({ lead, id }: { lead: B2BLeadFields; id: string }) {
  const updateLead = useUpdateB2BLead()
  const [form, setForm] = useState({
    next_action: lead.next_action ?? '',
    deal_value: lead.deal_value != null ? String(lead.deal_value) : '',
    visit_date: lead.visit_date ?? '',
    notes: lead.notes ?? '',
  })

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateLead.mutateAsync({
        id,
        input: {
          next_action: form.next_action || null,
          deal_value: form.deal_value ? Number(form.deal_value) : null,
          visit_date: form.visit_date || null,
          notes: form.notes || null,
        },
      })
      toast.success('Lead details updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update lead')
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-sm font-semibold mb-4">Lead Details</h2>
        <form onSubmit={handleSaveDetails} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="next_action">Next Action</Label>
            <Input
              id="next_action"
              placeholder="e.g. Schedule site visit"
              value={form.next_action}
              onChange={(e) => setForm((f) => ({ ...f, next_action: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="deal_value">Deal Value</Label>
              <div className="relative">
                <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  id="deal_value"
                  type="number"
                  className="pl-8"
                  value={form.deal_value}
                  onChange={(e) => setForm((f) => ({ ...f, deal_value: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="visit_date">Visit Date</Label>
              <Input
                id="visit_date"
                type="date"
                value={form.visit_date}
                onChange={(e) => setForm((f) => ({ ...f, visit_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Internal notes..."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={updateLead.isPending} className="bg-[#0244C6] hover:bg-[#012775]">
              {updateLead.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Details'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function B2BLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: lead, isLoading } = useB2BLead(id)
  const { data: activities, isLoading: activitiesLoading } = useB2BLeadActivities(id)
  const updateStage = useUpdateB2BLeadStage()
  const logActivity = useLogB2BLeadActivity()

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px]">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!lead) return null

  return (
    <div className="space-y-6 max-w-[1400px]">
      <Link href="/b2b" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to B2B CRM
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#0244C6]/10 flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6 text-[#0244C6]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{lead.venue_name ?? 'Unnamed Venue'}</h1>
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                {lead.venue_area && (
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{lead.venue_area}</span>
                )}
                {lead.venue_category && <span>· {String(lead.venue_category).replace(/_/g, ' ')}</span>}
                {lead.city?.name && <span>· {lead.city.name}</span>}
              </p>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {lead.owner_name && (
                  <span className="text-sm text-muted-foreground">{lead.owner_name}</span>
                )}
                {lead.owner_phone && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />{lead.owner_phone}
                  </span>
                )}
                {lead.owner_email && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />{lead.owner_email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <Select
              value={lead.pipeline_stage ?? undefined}
              onValueChange={(v) => updateStage.mutate({ id, stage: v })}
            >
              <SelectTrigger className="w-[160px] border-0 shadow-none p-0 h-auto [&>svg]:hidden">
                <B2BStageBadge stage={lead.pipeline_stage} />
              </SelectTrigger>
              <SelectContent>
                {B2B_STAGES.map((s: B2BStage) => (
                  <SelectItem key={s} value={s}>{STAGE_CONFIG[s].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {lead.assignee?.full_name && (
              <p className="text-xs text-muted-foreground">Assigned to {lead.assignee.full_name}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <B2BLeadDetailsForm key={id} lead={lead as B2BLeadFields} id={id} />

        {/* Activity */}
        <div>
          <h2 className="text-sm font-semibold mb-4">Activity</h2>
          <ActivityTimeline
            activities={activities}
            isLoading={activitiesLoading}
            isLogging={logActivity.isPending}
            onLog={async ({ activityType, content }) => {
              await logActivity.mutateAsync({ leadId: id, activityType, content })
            }}
          />
        </div>
      </div>
    </div>
  )
}
