'use client'

import { use, useState, useMemo } from 'react'
import Link from 'next/link'
import { useB2CLead, useUpdateB2CLead, useB2CLeadActivities, useLogB2CLeadActivity } from '@/features/b2c/hooks/use-b2c-lead-detail'
import { useVenuesForMatch } from '@/features/b2c/hooks/use-b2c-leads'
import { B2CStageSelect } from '@/features/b2c/components/b2c-stage-select'
import { ActivityTimeline } from '@/components/shared/activity-timeline'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Users, Phone, Mail, Calendar, IndianRupee, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface B2CLeadFields {
  next_action: string | null
  booking_amount: number | null
  commission_earned: number | null
  matched_venue_id: string | null
  event_date: string | null
  notes: string | null
}

function B2CLeadDetailsForm({ lead, id }: { lead: B2CLeadFields; id: string }) {
  const updateLead = useUpdateB2CLead()
  const { data: venues } = useVenuesForMatch()
  const derivedPercent = lead.booking_amount && lead.commission_earned
    ? String(Math.round((lead.commission_earned / lead.booking_amount) * 100))
    : '10'

  const [form, setForm] = useState({
    next_action: lead.next_action ?? '',
    booking_amount: lead.booking_amount != null ? String(lead.booking_amount) : '',
    commission_percent: derivedPercent,
    matched_venue_id: lead.matched_venue_id ?? '',
    event_date: lead.event_date ?? '',
    notes: lead.notes ?? '',
  })

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
          next_action: form.next_action || null,
          booking_amount: form.booking_amount ? Number(form.booking_amount) : null,
          commission_earned: form.booking_amount ? commissionEarned : null,
          matched_venue_id: form.matched_venue_id || null,
          event_date: form.event_date || null,
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
              placeholder="e.g. Share venue shortlist"
              value={form.next_action}
              onChange={(e) => setForm((f) => ({ ...f, next_action: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Matched Venue</Label>
            <Select
              value={form.matched_venue_id}
              onValueChange={(v) => setForm((f) => ({ ...f, matched_venue_id: v }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="No venue matched yet" />
              </SelectTrigger>
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
                <Input
                  id="booking_amount"
                  type="number"
                  className="pl-8"
                  value={form.booking_amount}
                  onChange={(e) => setForm((f) => ({ ...f, booking_amount: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event_date">Event Date</Label>
              <Input
                id="event_date"
                type="date"
                value={form.event_date}
                onChange={(e) => setForm((f) => ({ ...f, event_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="commission_percent">Commission %</Label>
              <Input
                id="commission_percent"
                type="number"
                value={form.commission_percent}
                onChange={(e) => setForm((f) => ({ ...f, commission_percent: e.target.value }))}
              />
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

export default function B2CLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: lead, isLoading } = useB2CLead(id)
  const { data: activities, isLoading: activitiesLoading } = useB2CLeadActivities(id)
  const logActivity = useLogB2CLeadActivity()

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
      <Link href="/b2c" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to B2C CRM
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#0244C6]/10 flex items-center justify-center shrink-0">
              <Users className="h-6 w-6 text-[#0244C6]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{lead.customer_name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
                {lead.event_type && <span>{String(lead.event_type).replace(/_/g, ' ')}</span>}
                {lead.guest_count && <span>· {lead.guest_count} guests</span>}
                {lead.city?.name && <span>· {lead.city.name}</span>}
              </p>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />{lead.customer_phone}
                </span>
                {lead.customer_email && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />{lead.customer_email}
                  </span>
                )}
                {lead.event_date && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(lead.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
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
            onLog={async ({ activityType, content }) => {
              await logActivity.mutateAsync({ customerLeadId: id, activityType, content })
            }}
          />
        </div>
      </div>
    </div>
  )
}
