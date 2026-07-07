'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { hasPermission, isCityScoped } from '@/lib/permissions'
import { useCreateVenueOperations } from '@/features/operations/hooks/use-operations'
import { useCities } from '@/features/b2b/hooks/use-b2b-leads'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { VenueCategory } from '@/types/database.types'

const VENUE_CATEGORIES: VenueCategory[] = [
  'banquet_hall', 'rooftop', 'farmhouse', 'hotel',
  'resort', 'restaurant', 'conference_room', 'outdoor', 'other',
]

export function AddVenueModal() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { data: cities } = useCities()
  const createVenue = useCreateVenueOperations()

  const scoped = isCityScoped(user?.roles ?? [])
  const defaultCityId = user?.profile.city_id ?? ''

  const [form, setForm] = useState({
    name: '', category: '', cityId: defaultCityId, area: '',
    ownerName: '', ownerPhone: '', ownerEmail: '',
    capacityMin: '', capacityMax: '', pricePerDay: '',
  })

  if (!hasPermission(user?.roles ?? [], 'ADD_VENUES')) return null

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function resetForm() {
    setForm({
      name: '', category: '', cityId: defaultCityId, area: '',
      ownerName: '', ownerPhone: '', ownerEmail: '',
      capacityMin: '', capacityMax: '', pricePerDay: '',
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cityId = scoped ? defaultCityId : form.cityId
    const cityName = (cities ?? []).find((c) => c.id === cityId)?.name
    if (!form.name || !form.category || !cityId || !cityName) {
      toast.error('Name, category and city are required')
      return
    }
    setLoading(true)
    try {
      await createVenue.mutateAsync({
        name: form.name,
        category: form.category,
        city_id: cityId,
        city: cityName,
        area: form.area || undefined,
        owner_name: form.ownerName || undefined,
        owner_phone: form.ownerPhone || undefined,
        owner_email: form.ownerEmail || undefined,
        capacity_min: form.capacityMin ? Number(form.capacityMin) : undefined,
        capacity_max: form.capacityMax ? Number(form.capacityMax) : undefined,
        price_per_day: form.pricePerDay ? Number(form.pricePerDay) : undefined,
        status: 'prospect',
      })
      toast.success(`${form.name} added`)
      setOpen(false)
      resetForm()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add venue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0244C6] hover:bg-[#012775] gap-2">
          <Plus className="h-4 w-4" />
          Add Venue
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Venue</DialogTitle>
          <DialogDescription>Add a new venue to start tracking its onboarding.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="venueName">Venue Name <span className="text-red-500">*</span></Label>
            <Input id="venueName" value={form.name} onChange={(e) => updateField('name', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category <span className="text-red-500">*</span></Label>
              <Select value={form.category} onValueChange={(v) => updateField('category', v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent position="popper">
                  {VENUE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="area">Area</Label>
              <Input id="area" value={form.area} onChange={(e) => updateField('area', e.target.value)} />
            </div>
          </div>

          {!scoped && (
            <div className="space-y-1.5">
              <Label>City <span className="text-red-500">*</span></Label>
              <Select value={form.cityId} onValueChange={(v) => updateField('cityId', v)}>
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
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input id="ownerName" value={form.ownerName} onChange={(e) => updateField('ownerName', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ownerPhone">Owner Phone</Label>
              <Input id="ownerPhone" value={form.ownerPhone} onChange={(e) => updateField('ownerPhone', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ownerEmail">Owner Email</Label>
            <Input id="ownerEmail" type="email" value={form.ownerEmail} onChange={(e) => updateField('ownerEmail', e.target.value)} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="capacityMin">Min Capacity</Label>
              <Input id="capacityMin" type="number" value={form.capacityMin} onChange={(e) => updateField('capacityMin', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="capacityMax">Max Capacity</Label>
              <Input id="capacityMax" type="number" value={form.capacityMax} onChange={(e) => updateField('capacityMax', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pricePerDay">Price/Day</Label>
              <Input id="pricePerDay" type="number" value={form.pricePerDay} onChange={(e) => updateField('pricePerDay', e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-[#0244C6] hover:bg-[#012775] min-w-[120px]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Venue'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
