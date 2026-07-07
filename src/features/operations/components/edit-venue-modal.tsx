'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { hasPermission, isCityScoped } from '@/lib/permissions'
import { useUpdateVenueOperations, useDeleteVenueOperations } from '@/features/operations/hooks/use-operations'
import { useCities } from '@/features/b2b/hooks/use-b2b-leads'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ConfirmDeleteButton } from '@/components/shared/confirm-delete-button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { VenueCategory, VenueStatus } from '@/types/database.types'

const VENUE_CATEGORIES: VenueCategory[] = [
  'banquet_hall', 'rooftop', 'farmhouse', 'hotel',
  'resort', 'restaurant', 'conference_room', 'outdoor', 'other',
]
const VENUE_STATUSES: VenueStatus[] = ['prospect', 'contacted', 'negotiating', 'onboarded', 'inactive']
const AGREEMENT_STATUSES = ['not_started', 'in_progress', 'signed']

export interface EditableVenue {
  id: string
  name: string
  category: string
  city_id: string | null
  area: string | null
  owner_name: string | null
  owner_phone: string | null
  owner_email: string | null
  capacity_min: number | null
  capacity_max: number | null
  price_per_day: number | null
  status: string
  agreement_status: string | null
  agreement_expiry: string | null
}

interface Props {
  venue: EditableVenue
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditVenueModal({ venue, open, onOpenChange }: Props) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const { data: cities } = useCities()
  const updateVenue = useUpdateVenueOperations()
  const deleteVenue = useDeleteVenueOperations()

  const scoped = isCityScoped(user?.roles ?? [])
  const canManage = hasPermission(user?.roles ?? [], 'ADD_VENUES')

  const [form, setForm] = useState({
    name: venue.name,
    category: venue.category,
    cityId: venue.city_id ?? '',
    area: venue.area ?? '',
    ownerName: venue.owner_name ?? '',
    ownerPhone: venue.owner_phone ?? '',
    ownerEmail: venue.owner_email ?? '',
    capacityMin: venue.capacity_min?.toString() ?? '',
    capacityMax: venue.capacity_max?.toString() ?? '',
    pricePerDay: venue.price_per_day?.toString() ?? '',
    status: venue.status,
    agreementStatus: venue.agreement_status ?? '',
    agreementExpiry: venue.agreement_expiry ?? '',
  })

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cityName = (cities ?? []).find((c) => c.id === form.cityId)?.name
    if (!form.name || !form.category || !form.cityId || !cityName) {
      toast.error('Name, category and city are required')
      return
    }
    setLoading(true)
    try {
      await updateVenue.mutateAsync({
        id: venue.id,
        input: {
          name: form.name,
          category: form.category,
          city_id: form.cityId,
          city: cityName,
          area: form.area || null,
          owner_name: form.ownerName || null,
          owner_phone: form.ownerPhone || null,
          owner_email: form.ownerEmail || null,
          capacity_min: form.capacityMin ? Number(form.capacityMin) : null,
          capacity_max: form.capacityMax ? Number(form.capacityMax) : null,
          price_per_day: form.pricePerDay ? Number(form.pricePerDay) : null,
          status: form.status,
          agreement_status: form.agreementStatus || null,
          agreement_expiry: form.agreementExpiry || null,
        },
      })
      toast.success('Venue updated')
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update venue')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteVenue.mutateAsync(venue.id)
      toast.success('Venue removed')
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove venue')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit Venue</DialogTitle>
          <DialogDescription>Update venue details, contract status, and onboarding info.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="editVenueName">Venue Name <span className="text-red-500">*</span></Label>
            <Input id="editVenueName" value={form.name} onChange={(e) => updateField('name', e.target.value)} required disabled={!canManage} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => updateField('category', v)} disabled={!canManage}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent position="popper">
                  {VENUE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editArea">Area</Label>
              <Input id="editArea" value={form.area} onChange={(e) => updateField('area', e.target.value)} disabled={!canManage} />
            </div>
          </div>

          {!scoped && (
            <div className="space-y-1.5">
              <Label>City</Label>
              <Select value={form.cityId} onValueChange={(v) => updateField('cityId', v)} disabled={!canManage}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent position="popper">
                  {(cities ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="editOwnerName">Owner Name</Label>
              <Input id="editOwnerName" value={form.ownerName} onChange={(e) => updateField('ownerName', e.target.value)} disabled={!canManage} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editOwnerPhone">Owner Phone</Label>
              <Input id="editOwnerPhone" value={form.ownerPhone} onChange={(e) => updateField('ownerPhone', e.target.value)} disabled={!canManage} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editOwnerEmail">Owner Email</Label>
            <Input id="editOwnerEmail" type="email" value={form.ownerEmail} onChange={(e) => updateField('ownerEmail', e.target.value)} disabled={!canManage} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="editCapacityMin">Min Capacity</Label>
              <Input id="editCapacityMin" type="number" value={form.capacityMin} onChange={(e) => updateField('capacityMin', e.target.value)} disabled={!canManage} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editCapacityMax">Max Capacity</Label>
              <Input id="editCapacityMax" type="number" value={form.capacityMax} onChange={(e) => updateField('capacityMax', e.target.value)} disabled={!canManage} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editPricePerDay">Price/Day</Label>
              <Input id="editPricePerDay" type="number" value={form.pricePerDay} onChange={(e) => updateField('pricePerDay', e.target.value)} disabled={!canManage} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => updateField('status', v)} disabled={!canManage}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent position="popper">
                  {VENUE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Agreement Status</Label>
              <Select value={form.agreementStatus} onValueChange={(v) => updateField('agreementStatus', v)} disabled={!canManage}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent position="popper">
                  {AGREEMENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editAgreementExpiry">Agreement Expiry</Label>
            <Input id="editAgreementExpiry" type="date" value={form.agreementExpiry ?? ''} onChange={(e) => updateField('agreementExpiry', e.target.value)} disabled={!canManage} />
          </div>

          {canManage && (
            <div className="flex justify-between items-center gap-3 pt-2">
              <ConfirmDeleteButton
                title="Remove this venue?"
                description={`"${venue.name}" will be removed from all active lists. This can't be undone from the UI.`}
                onConfirm={handleDelete}
                label="Remove Venue"
              />
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-[#0244C6] hover:bg-[#012775] min-w-[100px]">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
