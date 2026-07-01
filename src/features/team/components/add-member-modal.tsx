'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMemberAction } from '@/features/team/actions/create-member.action'
import { RoleName } from '@/types/auth.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const ROLES: { value: RoleName; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'city_lead', label: 'City Lead' },
  { value: 'sales_executive', label: 'Sales Executive' },
  { value: 'operations_executive', label: 'Operations Executive' },
  { value: 'venue_acquisition_executive', label: 'Venue Acquisition Executive' },
  { value: 'developer', label: 'Developer' },
  { value: 'hr', label: 'HR' },
]

const CITIES = [
  'Jaipur', 'Delhi NCR', 'Jaisalmer', 'Dehradun',
  'Mumbai', 'Bangalore', 'Hyderabad', 'Pune',
]

interface Props {
  onSuccess?: () => void
}

export function AddMemberModal({ onSuccess }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    designation: '',
    role: '' as RoleName | '',
  })

  function updateField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.role) {
      toast.error('Please select a role')
      return
    }

    setLoading(true)
    try {
      await createMemberAction({
        email: form.email,
        fullName: form.fullName,
        phone: form.phone || undefined,
        city: form.city || undefined,
        designation: form.designation || undefined,
        role: form.role as RoleName,
      })

      toast.success(`${form.fullName} added successfully! They'll receive a password setup email.`)
      setOpen(false)
      setForm({ fullName: '', email: '', phone: '', city: '', designation: '', role: '' })
      router.refresh()
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to add team member')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#0244C6] hover:bg-[#012775] gap-2">
          <UserPlus className="h-4 w-4" />
          Add Team Member
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Add New Team Member</DialogTitle>
          <DialogDescription>
            They'll receive an email to set their password and access Quick Venue OS.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
            <Input
              id="fullName"
              placeholder="Rahul Sharma"
              value={form.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              placeholder="rahul@quickvenue.com"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              required
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="9876543210"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
            />
          </div>

          {/* Role + City — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Role <span className="text-red-500">*</span></Label>
              <Select
                value={form.role}
                onValueChange={(v) => updateField('role', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>City</Label>
              <Select
                value={form.city}
                onValueChange={(v) => updateField('city', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Designation */}
          <div className="space-y-1.5">
            <Label htmlFor="designation">Designation</Label>
            <Input
              id="designation"
              placeholder="e.g. Senior Sales Executive"
              value={form.designation}
              onChange={(e) => updateField('designation', e.target.value)}
            />
          </div>

          {/* Actions */}
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
                'Add Member'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}