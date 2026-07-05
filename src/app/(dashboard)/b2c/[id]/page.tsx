'use client'

import { use, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/auth-provider'
import { hasPermission } from '@/lib/permissions'
import { useB2CLead, useUpdateB2CLead, useB2CLeadActivities, useLogB2CLeadActivity, useDeleteB2CLead } from '@/features/b2c/hooks/use-b2c-lead-detail'
import { useVenuesForMatch, useUpdateB2CLeadStage } from '@/features/b2c/hooks/use-b2c-leads'
import { useTeamMembers } from '@/features/team/hooks/use-team'
import { B2CStageSelect } from '@/features/b2c/components/b2c-stage-select'
import { B2C_STAGES, STAGE_CONFIG } from '@/features/b2c/components/b2c-stage-badge'
import { PipelineTimeline } from '@/components/shared/pipeline-timeline'
import { DeleteLeadButton } from '@/components/shared/delete-lead-button'
import { ActivityTimeline } from '@/components/shared/activity-timeline'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Users, IndianRupee, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const EVENT_TYPES = [
  'wedding', 'birthday', 'corporate', 'engagement',
  'anniversary', 'baby_shower', 'conference', 'other',
]
const LEAD_SOURCES = ['instagram', 'google', 'referral', 'whatsapp', 'walk_in', 'other']

const STAGE_LABELS = Object.fromEntries(B2C_STAGES.map((s) => [s, STAGE_CONFIG[s].label]))

interface B2CLeadFields {
  customer_name: string
  customer_phone: string
  customer_whatsapp: string | null
  customer_email: string | null
  event_type: string | null
  guest_count: number | null
  budget_min: number | null
  budget_max: number | null
  preferred_area: string | null
  special_requirements: string | null
  source: string | null
  assigned_to: string | null
  next_action: string | null
  booking_amount: number | null
  commission_earned: number | null
  matched_venue_id: string | null
  event_date: string | null
  follow_up_date: string | null
  notes: string | null
}

function B2CLeadDetailsForm({ lead, id }: { lead: B2CLeadFields; id: string }) {
  const updateLead = useUpdateB2CLead()
  const { data: venues } = useVenuesForMatch()
  const { data: teamMembers } = useTeamMembers()
  const derivedPercent = lead.booking_amount && lead.commission_earned
    ? String(Math.round((lead.commission_earned / lead.booking_amount) * 100))
    : '10'

  const [form, setForm] = useState({
    customer_name: lead.customer_name ?? '',
    customer_phone: lead.customer_phone ?? '',
    customer_whatsapp: lead.customer_whatsapp ?? '',
    customer_email: lead.customer_email ?? '',
    event_type: lead.event_type ?? '',
    guest_count: lead.guest_count != null ? String(lead.guest_count) : '',
    budget_min: lead.budget_min != null ? String(lead.budget_min) : '',
    budget_max: lead.budget_max != null ? String(lead.budget_max) : '',
    preferred_area: lead.preferred_area ?? '',
    special_requirements: lead.special_requirements ?? '',
    source: lead.source ?? '',
    assigned_to: lead.assigned_to ?? '',
    next_action: lead.next_action ?? '',
    booking_amount: lead.booking_amount != null ? String(lead.booking_amount) : '',
    commission_percent: derivedPercent,
    matched_venue_id: lead.matched_venue_id ?? '',
    event_date: lead.event_date ?? '',
    follow_up_date: lead.follow_up_date ?? '',
    notes: lead.notes ?? '',
  })

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const commissionEarned = useMemo(() => {
    const amount = Number(form.booking_amount)
    const percent = Number(form.commission_percent)
    if (!amount || !percent) return 0
    return Math.round(amount * (percent / 100))
  }, [form.booking_amount, form.commission_percent])

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateLead.mutateAsync({
        id,
        input: {
          customer_name: form.customer_name,
          customer_phone: form.customer_phone,
          customer_whatsapp: form.customer_whatsapp || null,
          customer_email: form.customer_email || null,
          event_type: form.event_type || null,
          guest_count: form.guest_count ? Number(form.guest_count) : null,
          budget_min: form.budget_min ? Number(form.budget_min) : null,
          budget_max: form.budget_max ? Number(form.budget_max) : null,
          preferred_area: form.preferred_area || null,
          special_requirements: form.special_requirements || null,
          source: form.source || null,
          assigned_to: form.assigned_to || null,
          next_action: form.next_action || null,
          booking_amount: form.booking_amount ? Number(form.booking_amount) : null,
          commission_earned: form.booking_amount ? commissionEarned : null,
          matched_venue_id: form.matched_venue_id || null,
          event_date: form.event_date || null,
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input id="customer_name" value={form.customer_name} onChange={(e) => set('customer_name', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer_phone">Phone</Label>
              <Input id="customer_phone" value={form.customer_phone} onChange={(e) => set('customer_phone', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="customer_whatsapp">WhatsApp</Label>
              <Input id="customer_whatsapp" value={form.customer_whatsapp} onChange={(e) => set('customer_whatsapp', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer_email">Email</Label>
              <Input id="customer_email" type="email" value={form.customer_email} onChange={(e) => set('customer_email', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Event Type</Label>
              <Select value={form.event_type} onValueChange={(v) => set('event_type', v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select event type" /></SelectTrigger>
                <SelectContent position="popper">
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event_date">Event Date</Label>
              <Input id="event_date" type="date" value={form.event_date} onChange={(e) => set('event_date', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="guest_count">Guests</Label>
              <Input id="guest_count" type="number" value={form.guest_count} onChange={(e) => set('guest_count', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget_min">Budget Min</Label>
              <Input id="budget_min" type="number" value={form.budget_min} onChange={(e) => set('budget_min', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budget_max">Budget Max</Label>
              <Input id="budget_max" type="number" value={form.budget_max} onChange={(e) => set('budget_max', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="preferred_area">Preferred Area</Label>
              <Input id="preferred_area" value={form.preferred_area} onChange={(e) => set('preferred_area', e.target.value)} />
            </div>
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="special_requirements">Special Requirements</Label>
            <Textarea
              id="special_requirements"
              value={form.special_requirements}
              onChange={(e) => set('special_requirements', e.target.value)}
              className="min-h-16"
            />
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
              placeholder="e.g. Share venue shortlist"
              value={form.next_action}
              onChange={(e) => set('next_action', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Matched Venue</Label>
            <Select value={form.matched_venue_id} onValueChange={(v) => set('matched_venue_id', v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="No venue matched yet" /></SelectTrigger>
              <SelectContent position="popper">
                {(venues ?? []).map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.name} · {v.city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="booking_amount">Booking Amount</Label>
              <div className="relative">
                <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input id="booking_amount" type="number" className="pl-8" value={form.booking_amount} onChange={(e) => set('booking_amount', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="follow_up_date">Follow-up Date</Label>
              <Input id="follow_up_date" type="date" value={form.follow_up_date} onChange={(e) => set('follow_up_date', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="commission_percent">Commission %</Label>
              <Input id="commission_percent" type="number" value={form.commission_percent} onChange={(e) => set('commission_percent', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Commission Earned</Label>
              <div className="h-9 flex items-center px-3 rounded-lg border bg-muted/50 text-sm font-semibold text-emerald-600">
                ₹{commissionEarned.toLocaleString('en-IN')}
              </div>
            </div>
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

export default function B2CLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const { data: lead, isLoading } = useB2CLead(id)
  const { data: activities, isLoading: activitiesLoading } = useB2CLeadActivities(id)
  const logActivity = useLogB2CLeadActivity()
  const deleteLead = useDeleteB2CLead()
  const updateStage = useUpdateB2CLeadStage()

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
        <Link href="/b2c" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to B2C CRM
        </Link>
        {canDelete && (
          <DeleteLeadButton
            entityLabel={lead.customer_name}
            onDelete={async () => {
              await deleteLead.mutateAsync(id)
              toast.success('Lead deleted')
              router.push('/b2c')
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
                <Users className="h-6 w-6 text-[#0244C6]" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">{lead.customer_name}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {lead.event_type && `${String(lead.event_type).replace(/_/g, ' ')} · `}
                  {lead.guest_count && `${lead.guest_count} guests · `}
                  {lead.city?.name}
                </p>
                {lead.matched_venue?.name && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Matched venue: <span className="font-medium text-foreground">{lead.matched_venue.name}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              <B2CStageSelect leadId={id} stage={lead.pipeline_stage} />
              {lead.assignee?.full_name && (
                <p className="text-xs text-muted-foreground">Assigned to {lead.assignee.full_name}</p>
              )}
            </div>
          </div>

          <PipelineTimeline
            stages={B2C_STAGES}
            labels={STAGE_LABELS}
            currentStage={lead.pipeline_stage}
            disabled={updateStage.isPending}
            onSelect={(stage) => updateStage.mutate({ id, stage })}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <B2CLeadDetailsForm key={id} lead={lead as B2CLeadFields} id={id} />

        {/* Activity */}
        <div>
          <h2 className="text-sm font-semibold mb-4">Activity</h2>
          <ActivityTimeline
            activities={activities}
            isLoading={activitiesLoading}
            isLogging={logActivity.isPending}
            onLog={async ({ activityType, content, occurredAt }) => {
              await logActivity.mutateAsync({ customerLeadId: id, activityType, content, occurredAt })
            }}
          />
        </div>
      </div>
    </div>
  )
}
