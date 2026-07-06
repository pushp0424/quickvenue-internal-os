'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { useTeamMembers } from '@/features/team/hooks/use-team'
import { useStartDirectChannel } from '@/features/chat/hooks/use-chat'
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

interface Props {
  onChannelReady: (channelId: string) => void
}

export function NewDMModal({ onChannelReady }: Props) {
  const { user } = useAuth()
  const { data: members, isLoading } = useTeamMembers()
  const startChannel = useStartDirectChannel()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = (members ?? []).filter(
    (m) => m.id !== user?.profile.id && m.is_active && m.full_name.toLowerCase().includes(search.toLowerCase())
  )

  async function handlePick(profileId: string) {
    try {
      const channelId = await startChannel.mutateAsync(profileId)
      setOpen(false)
      setSearch('')
      onChannelReady(channelId)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to start conversation')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="outline" className="shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
          <DialogDescription>Start a direct conversation with a team member.</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search people..." className="pl-9" />
        </div>
        <div className="max-h-72 overflow-y-auto -mx-1">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-1" />)
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No one found</p>
          ) : (
            filtered.map((m) => (
              <button
                key={m.id}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent text-left"
                onClick={() => handlePick(m.id)}
                disabled={startChannel.isPending}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[#0244C6] text-white text-xs font-bold">
                    {initials(m.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{m.full_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.designation ?? m.email}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
