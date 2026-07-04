'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { useCreateB2BLead, useCities } from '@/features/b2b/hooks/use-b2b-leads'
import { isCityScoped } from '@/lib/permissions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

const VENUE_CATEGORIES = [
  'banquet_hall', 'rooftop', 'farmhouse', 'hotel',
  'resort', 'restaurant', 'conference_room', 'outdoor', 'other',
]

export function AddB2BLeadModal() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { data: cities } = useCities()
  const createLead = useCreateB2BLead()

  const scoped = isCityScoped(user?.roles ?? [])
  const defaultCityId = user?.profile.city_id ?? ''

  const [form, setForm] = useState({
    venueName: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    venueCategory: '',
    venueArea: '',
    cityId: defaultCityId,
    notes: '',
  })

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cityId = scoped ? defaultCityId : form.cityId
    if (!cityId) {
      toast.error('Please select a city')
      return
    }

    setLoading(true)
    try {
      await createLead.mutateAsync({
        venue_name: form.venueName,
        owner_name: form.ownerName || undefined,
        owner_phone: form.ownerPhone || undefined,
        owner_email: form.ownerEmail || undefined,
        venue_category: form.venueCategory || undefined,
        venue_area: form.venueArea || undefined,
        city_id: cityId,
        notes: form.notes || undefined,
        pipeline_stage: 'prospect',
      })

      toast.success(`${form.venueName} added to B2B pipeline`)
      setOpen(false)
      setForm({
        venueName: '', ownerName: '', ownerPhone: '', ownerEmail: '',
        venueCategory: '', venueArea: '', cityId: defaultCityId, notes: '',
      })
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

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add B2B Lead</DialogTitle>
          <DialogDescription>
            Add a prospective venue to the B2B acquisition pipeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="venueName">Venue Name <span className="text-red-500">*</span></Label>
            <Input
              id="venueName"
              placeholder="The Grand Ballroom"
              value={form.venueName}
              onChange={(e) => updateField('venueName', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input
                id="ownerName"
                placeholder="Rajesh Kumar"
                value={form.ownerName}
                onChange={(e) => updateField('ownerName', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ownerPhone">Owner Phone</Label>
              <Input
                id="ownerPhone"
                placeholder="9876543210"
                value={form.ownerPhone}
                onChange={(e) => updateField('ownerPhone', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ownerEmail">Owner Email</Label>
            <Input
              id="ownerEmail"
              type="email"
              placeholder="owner@venue.com"
              value={form.ownerEmail}
              onChange={(e) => updateField('ownerEmail', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={form.venueCategory}
                onValueChange={(v) => updateField('venueCategory', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {VENUE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="venueArea">Area</Label>
              <Input
                id="venueArea"
                placeholder="e.g. Vaishali Nagar"
                value={form.venueArea}
                onChange={(e) => updateField('venueArea', e.target.value)}
              />
            </div>
          </div>

          {!scoped && (
            <div className="space-y-1.5">
              <Label>City <span className="text-red-500">*</span></Label>
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
