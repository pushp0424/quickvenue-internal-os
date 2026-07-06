'use client'

import { useState } from 'react'
import { useSearchMessages } from '@/features/chat/hooks/use-chat'
import { ChatChannel } from '@/services/supabase/chat-services'
import { NewDMModal } from '@/features/chat/components/new-dm-modal'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Megaphone, Users, Building2, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function channelTitle(channel: ChatChannel) {
  if (channel.type === 'direct') return channel.otherMember?.full_name ?? 'Direct Message'
  return channel.name
}

const GROUP_CONFIG: { type: ChatChannel['type']; label: string; icon: typeof Users }[] = [
  { type: 'direct', label: 'Direct Messages', icon: Users },
  { type: 'team', label: 'Team', icon: Users },
  { type: 'department', label: 'Department', icon: Building2 },
  { type: 'city', label: 'City', icon: MapPin },
  { type: 'announcement', label: 'Announcements', icon: Megaphone },
]

interface Props {
  channels: ChatChannel[]
  selectedChannelId: string | null
  onSelect: (channelId: string) => void
}

export function ChannelList({ channels, selectedChannelId, onSelect }: Props) {
  const [search, setSearch] = useState('')
  const { data: searchResults } = useSearchMessages(search)

  return (
    <div className="flex flex-col h-full border-r">
      <div className="flex items-center gap-2 h-16 px-3 border-b shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages..." className="pl-9 h-9" />
        </div>
        <NewDMModal onChannelReady={onSelect} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {search.trim().length > 1 ? (
          <div className="p-2">
            {(searchResults ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No messages found</p>
            ) : (
              (searchResults ?? []).map((r) => (
                <button
                  key={r.id}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-accent"
                  onClick={() => onSelect(r.channel_id)}
                >
                  <p className="text-xs font-medium text-muted-foreground">{r.channel?.name}</p>
                  <p className="text-sm truncate">{r.sender?.full_name}: {r.body}</p>
                </button>
              ))
            )}
          </div>
        ) : (
          GROUP_CONFIG.map((group) => {
            const items = channels.filter((c) => c.type === group.type)
            if (items.length === 0) return null
            return (
              <div key={group.type} className="py-2">
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <group.icon className="h-3 w-3" />
                  {group.label}
                </p>
                {items.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelect(c.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-accent transition-colors',
                      selectedChannelId === c.id && 'bg-accent'
                    )}
                  >
                    {c.type === 'direct' ? (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-[#0244C6] text-white text-xs font-bold">
                          {c.otherMember?.full_name ? initials(c.otherMember.full_name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <group.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className={cn('text-sm truncate', c.hasUnread && 'font-semibold')}>{channelTitle(c)}</p>
                      {c.lastMessageBody && (
                        <p className="text-xs text-muted-foreground truncate">{c.lastMessageBody}</p>
                      )}
                    </div>
                    {c.hasUnread && <Badge className="h-2 w-2 p-0 rounded-full bg-[#0244C6] shrink-0" />}
                  </button>
                ))}
              </div>
            )
          })
        )}
        {channels.length === 0 && search.trim().length <= 1 && (
          <p className="text-sm text-muted-foreground text-center py-8">No conversations yet</p>
        )}
      </div>
    </div>
  )
}
