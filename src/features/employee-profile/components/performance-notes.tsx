'use client'

import { useState } from 'react'
import { usePerformanceNotes, useAddPerformanceNote } from '@/features/employee-profile/hooks/use-employee-profile'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ClipboardList, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  profileId: string
  canAdd: boolean
}

export function PerformanceNotes({ profileId, canAdd }: Props) {
  const { data: notes, isLoading } = usePerformanceNotes(profileId)
  const addNote = useAddPerformanceNote()
  const [note, setNote] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!note.trim()) return
    try {
      await addNote.mutateAsync({ profileId, note: note.trim() })
      setNote('')
      toast.success('Note added')
    } catch {
      toast.error('Failed to add note')
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-sm font-semibold mb-4">Performance History</h2>

        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : !notes || notes.length === 0 ? (
          <div className="text-center py-6">
            <ClipboardList className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-sm text-muted-foreground">No notes logged yet.</p>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            {notes.map((n) => (
              <div key={n.id} className="border-l-2 border-[#0244C6]/30 pl-3 py-0.5">
                <p className="text-sm">{n.note}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {n.author?.full_name ?? 'Unknown'} · {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}

        {canAdd && (
          <form onSubmit={handleAdd} className="space-y-2">
            <Textarea placeholder="Log a performance note..." value={note} onChange={(e) => setNote(e.target.value)} className="min-h-16" />
            <div className="flex justify-end">
              <Button type="submit" disabled={addNote.isPending} className="bg-[#0244C6] hover:bg-[#012775]">
                {addNote.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Note'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
