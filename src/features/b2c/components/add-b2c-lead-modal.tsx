'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { useCreateB2CLead } from '@/features/b2c/hooks/use-b2c-leads'
import { useCities } from '@/features/b2b/hooks/use-b2b-leads'
import { useTeamMembers } from '@/features/team/hooks/use-team'
import { isCityScoped } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const EVENT_TYPES = [
  'wedding', 'birthday', 'corporate', 'engagement',
  'anniversary', 'baby_shower', 'conference', 'other',
]

const LEAD_SOURCES = ['instagram', 'google', 'referral', 'whatsapp', 'walk_in', 'other']

const initialFormState = (defaultCityId: string) => ({
  customerName: '',
  customerPhone: '',
  customerWhatsapp: '',
  customerEmail: '',
  eventType: '',
  eventDate: '',
  guestCount: '',
  budgetMin: '',
  budgetMax: '',
  cityId: defaultCityId,
  preferredArea: '',
  source: '',
  followUpDate: '',
  assignedTo: '',
  specialRequirements: '',
  notes: '',
})

export function AddB2CLeadModal() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { data: cities } = useCities()
  const { data: teamMembers } = useTeamMembers()
  const createLead = useCreateB2CLead()

  const scoped = isCityScoped(user?.roles ?? [])
  const defaultCityId = user?.profile.city_id ?? ''

  const [form, setForm] = useState(initialFormState(defaultCityId))

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.customerName || !form.customerPhone) {
      toast.error('Customer name and phone are required')
      return
    }

    setLoading(true)
    try {
      await createLead.mutateAsync({
        customer_name: form.customerName,
        customer_phone: form.customerPhone,
        customer_whatsapp: form.customerWhatsapp || undefined,
        customer_email: form.customerEmail || undefined,
        event_type: form.eventType || undefined,
        event_date: form.eventDate || undefined,
        guest_count: form.guestCount ? Number(form.guestCount) : undefined,
        budget_min: form.budgetMin ? Number(form.budgetMin) : undefined,
        budget_max: form.budgetMax ? Number(form.budgetMax) : undefined,
        city_id: (scoped ? defaultCityId : form.cityId) || undefined,
        preferred_area: form.preferredArea || undefined,
        source: form.source || undefined,
        follow_up_date: form.followUpDate || undefined,
        assigned_to: form.assignedTo || undefined,
        special_requirements: form.specialRequirements || undefined,
        notes: form.notes || undefined,
        pipeline_stage: 'new_lead',
      })

      toast.success(`${form.customerName} added to B2C pipeline`)
      setOpen(false)
      setForm(initialFormState(defaultCityId))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add lead')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0244C6] hover:bg-[#012775] gap-2">
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add B2C Lead</DialogTitle>
          <DialogDescription>
            Add a prospective customer to the B2C sales pipeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="customerName">Customer Name <span className="text-red-500">*</span></Label>
              <Input
                id="customerName"
                placeholder="Priya Sharma"
                value={form.customerName}
                onChange={(e) => updateField('customerName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerPhone">Phone <span className="text-red-500">*</span></Label>
              <Input
                id="customerPhone"
                placeholder="9876543210"
                value={form.customerPhone}
                onChange={(e) => updateField('customerPhone', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="customerWhatsapp">WhatsApp</Label>
              <Input
                id="customerWhatsapp"
                placeholder="9876543210"
                value={form.customerWhatsapp}
                onChange={(e) => updateField('customerWhatsapp', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="priya@email.com"
                value={form.customerEmail}
                onChange={(e) => updateField('customerEmail', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Event Type</Label>
              <Select
                value={form.eventType}
                onValueChange={(v) => updateField('eventType', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="eventDate">Event Date</Label>
              <Input
                id="eventDate"
                type="date"
                value={form.eventDate}
                onChange={(e) => updateField('eventDate', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="guestCount">Guests</Label>
              <Input
                id="guestCount"
                type="number"
                placeholder="150"
                value={form.guestCount}
                onChange={(e) => updateField('guestCount', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budgetMin">Budget Min</Label>
              <Input
                id="budgetMin"
                type="number"
                placeholder="50000"
                value={form.budgetMin}
                onChange={(e) => updateField('budgetMin', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="budgetMax">Budget Max</Label>
              <Input
                id="budgetMax"
                type="number"
                placeholder="150000"
                value={form.budgetMax}
                onChange={(e) => updateField('budgetMax', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {!scoped && (
              <div className="space-y-1.5">
                <Label>City</Label>
                <Select
                  value={form.cityId}
                  onValueChange={(v) => updateField('cityId', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {(cities ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="preferredArea">Preferred Area</Label>
              <Input
                id="preferredArea"
                placeholder="e.g. Vaishali Nagar"
                value={form.preferredArea}
                onChange={(e) => updateField('preferredArea', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select value={form.source} onValueChange={(v) => updateField('source', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <Input
                id="followUpDate"
                type="date"
                value={form.followUpDate}
                onChange={(e) => updateField('followUpDate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Assigned To</Label>
            <Select value={form.assignedTo} onValueChange={(v) => updateField('assignedTo', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Me" />
              </SelectTrigger>
              <SelectContent>
                {(teamMembers ?? []).map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="specialRequirements">Special Requirements</Label>
            <Textarea
              id="specialRequirements"
              placeholder="Dietary restrictions, decor preferences..."
              value={form.specialRequirements}
              onChange={(e) => updateField('specialRequirements', e.target.value)}
              className="min-h-16"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Any additional context..."
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#0244C6] hover:bg-[#012775] min-w-[120px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </span>
              ) : (
                'Add Lead'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
