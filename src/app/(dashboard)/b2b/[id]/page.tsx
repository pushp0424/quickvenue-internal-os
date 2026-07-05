'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/auth-provider'
import { hasPermission } from '@/lib/permissions'
import { useB2BLead, useUpdateB2BLead, useDeleteB2BLead } from '@/features/b2b/hooks/use-b2b-lead-detail'
import { useB2BLeadActivities, useLogB2BLeadActivity } from '@/features/b2b/hooks/use-b2b-lead-detail'
import { useTeamMembers } from '@/features/team/hooks/use-team'
import { useUpdateB2BLeadStage } from '@/features/b2b/hooks/use-b2b-leads'
import { B2BStageSelect } from '@/features/b2b/components/b2b-stage-select'
import { B2B_STAGES, STAGE_CONFIG } from '@/features/b2b/components/b2b-stage-badge'
import { B2B_PRIORITIES } from '@/features/b2b/components/b2b-priority-badge'
import { PipelineTimeline } from '@/components/shared/pipeline-timeline'
import { DeleteLeadButton } from '@/components/shared/delete-lead-button'
import { ActivityTimeline } from '@/components/shared/activity-timeline'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Building2, IndianRupee, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const VENUE_CATEGORIES = [
  'banquet_hall', 'rooftop', 'farmhouse', 'hotel',
  'resort', 'restaurant', 'conference_room', 'outdoor', 'other',
]
const LEAD_SOURCES = ['cold_call', 'referral', 'walk_in', 'instagram', 'google', 'other']

const STAGE_LABELS = Object.fromEntries(B2B_STAGES.map((s) => [s, STAGE_CONFIG[s].label]))

interface B2BLeadFields {
  venue_name: string | null
  venue_category: string | null
  venue_area: string | null
  venue_address: string | null
  owner_name: string | null
  owner_phone: string | null
  owner_whatsapp: string | null
  owner_email: string | null
  capacity: string | null
  price_range: string | null
  source: string | null
  priority: string | null
  assigned_to: string | null
  next_action: string | null
  deal_value: number | null
  visit_date: string | null
  visit_done: boolean | null
  follow_up_date: string | null
  notes: string | null
}

function B2BLeadDetailsForm({ lead, id }: { lead: B2BLeadFields; id: string }) {
  const updateLead = useUpdateB2BLead()
  const { data: teamMembers } = useTeamMembers()
  const [form, setForm] = useState({
    venue_name: lead.venue_name ?? '',
    venue_category: lead.venue_category ?? '',
    venue_area: lead.venue_area ?? '',
    venue_address: lead.venue_address ?? '',
    owner_name: lead.owner_name ?? '',
    owner_phone: lead.owner_phone ?? '',
    owner_whatsapp: lead.owner_whatsapp ?? '',
    owner_email: lead.owner_email ?? '',
    capacity: lead.capacity ?? '',
    price_range: lead.price_range ?? '',
    source: lead.source ?? '',
    priority: lead.priority ?? 'medium',
    assigned_to: lead.assigned_to ?? '',
    next_action: lead.next_action ?? '',
    deal_value: lead.deal_value != null ? String(lead.deal_value) : '',
    visit_date: lead.visit_date ?? '',
    visit_done: lead.visit_done ?? false,
    follow_up_date: lead.follow_up_date ?? '',
    notes: lead.notes ?? '',
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateLead.mutateAsync({
        id,
        input: {
          venue_name: form.venue_name,
          venue_category: form.venue_category || null,
          venue_area: form.venue_area || null,
          venue_address: form.venue_address || null,
          owner_name: form.owner_name || null,
          owner_phone: form.owner_phone || null,
          owner_whatsapp: form.owner_whatsapp || null,
          owner_email: form.owner_email || null,
          capacity: form.capacity || null,
          price_range: form.price_range || null,
          source: form.source || null,
          priority: form.priority,
          assigned_to: form.assigned_to || null,
          next_action: form.next_action || null,
          deal_value: form.deal_value ? Number(form.deal_value) : null,
          visit_date: form.visit_date || null,
          visit_done: form.visit_done,
          follow_up_date: form.follow_up_date || null,
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
            <Label htmlFor="venue_name">Venue Name</Label>
            <Input id="venue_name" value={form.venue_name} onChange={(e) => set('venue_name', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="owner_name">Owner Name</Label>
              <Input id="owner_name" value={form.owner_name} onChange={(e) => set('owner_name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="owner_phone">Owner Phone</Label>
              <Input id="owner_phone" value={form.owner_phone} onChange={(e) => set('owner_phone', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="owner_whatsapp">Owner WhatsApp</Label>
              <Input id="owner_whatsapp" value={form.owner_whatsapp} onChange={(e) => set('owner_whatsapp', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="owner_email">Owner Email</Label>
              <Input id="owner_email" type="email" value={form.owner_email} onChange={(e) => set('owner_email', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.venue_category} onValueChange={(v) => set('venue_category', v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent position="popper">
                  {VENUE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="venue_area">Area</Label>
              <Input id="venue_area" value={form.venue_area} onChange={(e) => set('venue_area', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="venue_address">Full Address</Label>
            <Input id="venue_address" value={form.venue_address} onChange={(e) => set('venue_address', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" value={form.capacity} onChange={(e) => set('capacity', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price_range">Price Range</Label>
              <Input id="price_range" value={form.price_range} onChange={(e) => set('price_range', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select value={form.source} onValueChange={(v) => set('source', v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select source" /></SelectTrigger>
                <SelectContent position="popper">
                  {LEAD_SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set('priority', v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent position="popper">
                  {B2B_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Assigned To</Label>
            <Select value={form.assigned_to} onValueChange={(v) => set('assigned_to', v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent position="popper">
                {(teamMembers ?? []).map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="next_action">Next Action</Label>
            <Input
              id="next_action"
              placeholder="e.g. Schedule site visit"
              value={form.next_action}
              onChange={(e) => set('next_action', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="deal_value">Deal Value</Label>
              <div className="relative">
                <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input id="deal_value" type="number" className="pl-8" value={form.deal_value} onChange={(e) => set('deal_value', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="visit_date">Visit Date</Label>
              <Input id="visit_date" type="date" value={form.visit_date} onChange={(e) => set('visit_date', e.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer w-fit">
            <Checkbox
              checked={form.visit_done}
              onCheckedChange={(checked) => set('visit_done', checked === true)}
            />
            Site visit done
          </label>

          <div className="space-y-1.5">
            <Label htmlFor="follow_up_date">Follow-up Date</Label>
            <Input id="follow_up_date" type="date" value={form.follow_up_date} onChange={(e) => set('follow_up_date', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Input id="notes" placeholder="Internal notes..." value={form.notes} onChange={(e) => set('notes', e.target.value)} />
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
  const router = useRouter()
  const { user } = useAuth()
  const { data: lead, isLoading } = useB2BLead(id)
  const { data: activities, isLoading: activitiesLoading } = useB2BLeadActivities(id)
  const logActivity = useLogB2BLeadActivity()
  const deleteLead = useDeleteB2BLead()
  const updateStage = useUpdateB2BLeadStage()

  const canDelete = hasPermission(user?.roles ?? [], 'DELETE_LEADS')

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
      <div className="flex items-center justify-between">
        <Link href="/b2b" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to B2B CRM
        </Link>
        {canDelete && (
          <DeleteLeadButton
            entityLabel={lead.venue_name ?? 'this lead'}
            onDelete={async () => {
              await deleteLead.mutateAsync(id)
              toast.success('Lead deleted')
              router.push('/b2b')
            }}
          />
        )}
      </div>

      {/* Header */}
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#0244C6]/10 flex items-center justify-center shrink-0">
                <Building2 className="h-6 w-6 text-[#0244C6]" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">{lead.venue_name ?? 'Unnamed Venue'}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {lead.venue_area && `${lead.venue_area} · `}
                  {lead.venue_category && `${String(lead.venue_category).replace(/_/g, ' ')} · `}
                  {lead.city?.name}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              <B2BStageSelect leadId={id} stage={lead.pipeline_stage} />
              {lead.assignee?.full_name && (
                <p className="text-xs text-muted-foreground">Assigned to {lead.assignee.full_name}</p>
              )}
            </div>
          </div>

          <PipelineTimeline
            stages={B2B_STAGES}
            labels={STAGE_LABELS}
            currentStage={lead.pipeline_stage ?? 'prospect'}
            disabled={updateStage.isPending}
            onSelect={(stage) => updateStage.mutate({ id, stage })}
          />
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
            onLog={async ({ activityType, content, occurredAt }) => {
              await logActivity.mutateAsync({ leadId: id, activityType, content, occurredAt })
            }}
          />
        </div>
      </div>
    </div>
  )
}
