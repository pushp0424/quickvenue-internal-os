'use client'

import { useEffect, useRef } from 'react'
import { useMessages, useRealtimeMessages, useMarkChannelRead } from '@/features/chat/hooks/use-chat'
import { ChatChannel } from '@/services/supabase/chat-services'
import { MessageBubble } from '@/features/chat/components/message-bubble'
import { MessageComposer } from '@/features/chat/components/message-composer'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, MessageSquare, Megaphone } from 'lucide-react'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function channelTitle(channel: ChatChannel) {
  if (channel.type === 'direct') return channel.otherMember?.full_name ?? 'Direct Message'
  return channel.name
}

interface Props {
  channel: ChatChannel
  onBack?: () => void
}

export function MessageThread({ channel, onBack }: Props) {
  const { data: messages, isLoading } = useMessages(channel.id)
  const markRead = useMarkChannelRead()
  const bottomRef = useRef<HTMLDivElement>(null)

  useRealtimeMessages(channel.id)

  useEffect(() => {
    markRead.mutate(channel.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages?.length])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 border-b px-4 py-3 shrink-0">
        {onBack && (
          <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        {channel.type === 'direct' ? (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-[#0244C6] text-white text-xs font-bold">
              {channel.otherMember?.full_name ? initials(channel.otherMember.full_name) : '?'}
            </AvatarFallback>
          </Avatar>
        ) : channel.type === 'announcement' ? (
          <Megaphone className="h-5 w-5 text-[#D4AF37]" />
        ) : (
          <MessageSquare className="h-5 w-5 text-muted-foreground" />
        )}
        <span className="font-semibold text-sm">{channelTitle(channel)}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-2/3" />)
        ) : !messages || messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No messages yet — say hello!</p>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} channelId={channel.id} />)
        )}
        <div ref={bottomRef} />
      </div>

      <MessageComposer channelId={channel.id} />
    </div>
  )
}
