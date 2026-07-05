'use client'

import { useState } from 'react'
import { useUpdateEmployeeProfile, useDepartments } from '@/features/employee-profile/hooks/use-employee-profile'
import { useTeamMembers } from '@/features/team/hooks/use-team'
import { useCities } from '@/features/b2b/hooks/use-b2b-leads'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  profileId: string
  profile: {
    employee_id: string | null
    department_id: string | null
    designation: string | null
    reporting_manager_id: string | null
    team: string | null
    city_id: string | null
    date_of_joining: string | null
  }
  editable: boolean
}

export function OfficialDetailsForm({ profileId, profile, editable }: Props) {
  const updateProfile = useUpdateEmployeeProfile()
  const { data: departments } = useDepartments()
  const { data: teamMembers } = useTeamMembers()
  const { data: cities } = useCities()

  const [form, setForm] = useState({
    employee_id: profile.employee_id ?? '',
    department_id: profile.department_id ?? '',
    designation: profile.designation ?? '',
    reporting_manager_id: profile.reporting_manager_id ?? '',
    team: profile.team ?? '',
    city_id: profile.city_id ?? '',
    date_of_joining: profile.date_of_joining ?? '',
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
          employee_id: form.employee_id || null,
          department_id: form.department_id || null,
          designation: form.designation || null,
          reporting_manager_id: form.reporting_manager_id || null,
          team: form.team || null,
          city_id: form.city_id || null,
          date_of_joining: form.date_of_joining || null,
        },
      })
      toast.success('Official details updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update details')
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-sm font-semibold mb-4">Official Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="employee_id">Employee ID</Label>
              <Input id="employee_id" value={form.employee_id} onChange={(e) => set('employee_id', e.target.value)} disabled={!editable} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" value={form.designation} onChange={(e) => set('designation', e.target.value)} disabled={!editable} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={form.department_id} onValueChange={(v) => set('department_id', v)} disabled={!editable}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent position="popper">
                  {(departments ?? []).map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team">Team</Label>
              <Input id="team" value={form.team} onChange={(e) => set('team', e.target.value)} disabled={!editable} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Reporting Manager</Label>
            <Select value={form.reporting_manager_id} onValueChange={(v) => set('reporting_manager_id', v)} disabled={!editable}>
              <SelectTrigger className="w-full"><SelectValue placeholder="No manager set" /></SelectTrigger>
              <SelectContent position="popper">
                {(teamMembers ?? []).filter((m) => m.id !== profileId).map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>City</Label>
              <Select value={form.city_id} onValueChange={(v) => set('city_id', v)} disabled={!editable}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent position="popper">
                  {(cities ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="date_of_joining">Joining Date</Label>
              <Input id="date_of_joining" type="date" value={form.date_of_joining} onChange={(e) => set('date_of_joining', e.target.value)} disabled={!editable} />
            </div>
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
