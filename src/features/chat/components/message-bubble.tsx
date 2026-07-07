'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth-provider'
import { useToggleReaction, useChatAttachmentSignedUrl, useDeleteMessage } from '@/features/chat/hooks/use-chat'
import { hasPermission } from '@/lib/permissions'
import { ChatMessage } from '@/services/supabase/chat-services'
import { ConfirmDeleteButton } from '@/components/shared/confirm-delete-button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { FileText, SmilePlus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉']

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function highlightMentions(body: string, isMine: boolean) {
  const parts = body.split(/(@[A-Za-z][\w' ]*?(?=[,.!?]|\s@|$))/g)
  return parts.map((part, i) =>
    part.startsWith('@') ? (
      <span key={i} className={cn('font-semibold underline underline-offset-2', isMine ? 'text-white' : 'text-[#0244C6]')}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}

interface Props {
  message: ChatMessage
  channelId: string
}

export function MessageBubble({ message, channelId }: Props) {
  const { user } = useAuth()
  const toggleReaction = useToggleReaction()
  const getSignedUrl = useChatAttachmentSignedUrl()
  const deleteMessage = useDeleteMessage()
  const [downloading, setDownloading] = useState(false)
  const isMine = message.sender_id === user?.profile.id
  const canDelete = isMine || hasPermission(user?.roles ?? [], 'MANAGE_USERS')

  async function handleDelete() {
    try {
      await deleteMessage.mutateAsync({ messageId: message.id, channelId })
      toast.success('Message deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete message')
    }
  }

  const reactionGroups = new Map<string, string[]>()
  message.reactions.forEach((r) => {
    const list = reactionGroups.get(r.emoji) ?? []
    list.push(r.profile_id)
    reactionGroups.set(r.emoji, list)
  })

  async function handleDownload() {
    if (!message.file_path) return
    setDownloading(true)
    try {
      const url = await getSignedUrl.mutateAsync(message.file_path)
      window.open(url, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className={cn('flex gap-2.5 group', isMine && 'flex-row-reverse')}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-[#0244C6] text-white text-[10px] font-bold">
          {message.sender?.full_name ? initials(message.sender.full_name) : '?'}
        </AvatarFallback>
      </Avatar>
      <div className={cn('max-w-[75%] space-y-1', isMine && 'items-end flex flex-col')}>
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-medium">{message.sender?.full_name ?? 'Unknown'}</span>
          <span className="text-[11px] text-muted-foreground">{formatTime(message.created_at)}</span>
        </div>
        <div className={cn(
          'rounded-2xl px-3.5 py-2 text-sm',
          isMine ? 'bg-[#0244C6] text-white' : 'bg-muted'
        )}>
          {message.body && <p className="whitespace-pre-wrap break-words">{highlightMentions(message.body, isMine)}</p>}
          {message.file_name && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className={cn(
                'flex items-center gap-1.5 text-xs mt-1 underline underline-offset-2',
                isMine ? 'text-white/90' : 'text-foreground'
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              {message.file_name}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {Array.from(reactionGroups.entries()).map(([emoji, ids]) => (
            <button
              key={emoji}
              onClick={() => toggleReaction.mutate({ messageId: message.id, emoji, channelId })}
              className={cn(
                'text-xs px-1.5 py-0.5 rounded-full border flex items-center gap-1',
                ids.includes(user?.profile.id ?? '') ? 'bg-[#0244C6]/10 border-[#0244C6]' : 'bg-transparent'
              )}
            >
              {emoji} {ids.length}
            </button>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100">
                <SmilePlus className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="flex gap-1 p-1 w-auto min-w-0">
              {REACTION_EMOJIS.map((emoji) => (
                <DropdownMenuItem
                  key={emoji}
                  className="text-base px-1.5 py-1 justify-center"
                  onClick={() => toggleReaction.mutate({ messageId: message.id, emoji, channelId })}
                >
                  {emoji}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {canDelete && (
            <ConfirmDeleteButton
              iconOnly
              className="h-5 w-5 opacity-0 group-hover:opacity-100"
              title="Delete message?"
              description="This permanently removes the message for everyone in the conversation."
              onConfirm={handleDelete}
            />
          )}
        </div>
      </div>
    </div>
  )
}
