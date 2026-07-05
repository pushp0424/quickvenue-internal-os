'use client'

import { useState } from 'react'
import { useSkills, useAddSkill, useDeleteSkill } from '@/features/employee-profile/hooks/use-employee-profile'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'

const PROFICIENCY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert']

interface Props {
  profileId: string
  editable: boolean
}

export function SkillsList({ profileId, editable }: Props) {
  const { data: skills, isLoading } = useSkills(profileId)
  const addSkill = useAddSkill()
  const deleteSkill = useDeleteSkill()
  const [skillName, setSkillName] = useState('')
  const [proficiency, setProficiency] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!skillName.trim()) return
    try {
      await addSkill.mutateAsync({ profileId, skillName: skillName.trim(), proficiency: proficiency || undefined })
      setSkillName('')
      setProficiency('')
    } catch {
      toast.error('Failed to add skill')
    }
  }

  async function handleRemove(id: string) {
    try {
      await deleteSkill.mutateAsync({ id, profileId })
    } catch {
      toast.error('Failed to remove skill')
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-sm font-semibold mb-4">Skills</h2>

        {isLoading ? (
          <Skeleton className="h-8 w-full" />
        ) : !skills || skills.length === 0 ? (
          <p className="text-sm text-muted-foreground">No skills added yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((s) => (
              <Badge key={s.id} variant="outline" className="gap-1.5 py-1.5 px-2.5">
                {s.skill_name}
                {s.proficiency && <span className="text-muted-foreground">· {s.proficiency}</span>}
                {editable && (
                  <button type="button" onClick={() => handleRemove(s.id)} className="hover:text-red-600 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        )}

        {editable && (
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input placeholder="Add a skill..." value={skillName} onChange={(e) => setSkillName(e.target.value)} className="flex-1" />
            <Select value={proficiency} onValueChange={setProficiency}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Level" /></SelectTrigger>
              <SelectContent position="popper">
                {PROFICIENCY_LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit" size="icon" disabled={addSkill.isPending} className="bg-[#0244C6] hover:bg-[#012775] shrink-0">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
