'use client'

import { useMemo, useRef, useState } from 'react'
import {
  useChannelMembers, useSendMessage, useUploadChatAttachment,
} from '@/features/chat/hooks/use-chat'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Paperclip, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  channelId: string
}

export function MessageComposer({ channelId }: Props) {
  const { data: members } = useChannelMembers(channelId)
  const sendMessage = useSendMessage()
  const uploadAttachment = useUploadChatAttachment()
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const mentionCandidates = useMemo(() => {
    if (!showMentions || !members) return []
    return members.filter((m) => m.full_name.toLowerCase().includes(mentionQuery.toLowerCase()))
  }, [showMentions, mentionQuery, members])

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value
    setBody(value)
    const match = value.match(/@([\w' ]*)$/)
    if (match) {
      setShowMentions(true)
      setMentionQuery(match[1])
    } else {
      setShowMentions(false)
    }
  }

  function pickMention(fullName: string) {
    setBody((b) => b.replace(/@([\w' ]*)$/, `@${fullName} `))
    setShowMentions(false)
  }

  function extractMentionedIds(text: string): string[] {
    if (!members) return []
    return members.filter((m) => text.includes(`@${m.full_name}`)).map((m) => m.id)
  }

  async function handleSend() {
    if (!body.trim()) return
    setSending(true)
    try {
      await sendMessage.mutateAsync({
        channelId,
        body: body.trim(),
        mentionedProfileIds: extractMentionedIds(body),
      })
      setBody('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { filePath, fileName } = await uploadAttachment.mutateAsync({ channelId, file })
      await sendMessage.mutateAsync({ channelId, filePath, fileName })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="relative border-t p-3">
      {mentionCandidates.length > 0 && (
        <div className="absolute bottom-full left-3 mb-1 w-64 rounded-lg border bg-popover shadow-md overflow-hidden">
          {mentionCandidates.map((m) => (
            <button
              key={m.id}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent"
              onClick={() => pickMention(m.full_name)}
            >
              {m.full_name}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <Button
          type="button" variant="ghost" size="icon" className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
        </Button>
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
        <Textarea
          value={body}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... use @ to mention someone"
          className="min-h-10 max-h-32 resize-none flex-1"
        />
        <Button
          type="button" size="icon" className="shrink-0 bg-[#0244C6] hover:bg-[#012775]"
          onClick={handleSend}
          disabled={sending || !body.trim()}
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
