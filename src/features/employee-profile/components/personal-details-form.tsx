'use client'

import { useState } from 'react'
import { useUpdateEmployeeProfile } from '@/features/employee-profile/hooks/use-employee-profile'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  profileId: string
  profile: {
    full_name: string
    email: string
    phone: string | null
    address: string | null
    date_of_birth: string | null
    emergency_contact: string | null
  }
  editable: boolean
}

export function PersonalDetailsForm({ profileId, profile, editable }: Props) {
  const updateProfile = useUpdateEmployeeProfile()
  const [form, setForm] = useState({
    full_name: profile.full_name ?? '',
    phone: profile.phone ?? '',
    address: profile.address ?? '',
    date_of_birth: profile.date_of_birth ?? '',
    emergency_contact: profile.emergency_contact ?? '',
  })

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await updateProfile.mutateAsync({
        id: profileId,
        input: {
          full_name: form.full_name,
          phone: form.phone || null,
          address: form.address || null,
          date_of_birth: form.date_of_birth || null,
          emergency_contact: form.emergency_contact || null,
        },
      })
      toast.success('Personal details updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update details')
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-sm font-semibold mb-4">Personal Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full Name</Label>
              <Input id="full_name" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} disabled={!editable} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={profile.email} disabled />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} disabled={!editable} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input id="date_of_birth" type="date" value={form.date_of_birth} onChange={(e) => set('date_of_birth', e.target.value)} disabled={!editable} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={form.address} onChange={(e) => set('address', e.target.value)} disabled={!editable} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="emergency_contact">Emergency Contact</Label>
            <Input id="emergency_contact" placeholder="Name and phone number" value={form.emergency_contact} onChange={(e) => set('emergency_contact', e.target.value)} disabled={!editable} />
          </div>

          {editable && (
            <div className="flex justify-end">
              <Button type="submit" disabled={updateProfile.isPending} className="bg-[#0244C6] hover:bg-[#012775]">
                {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
