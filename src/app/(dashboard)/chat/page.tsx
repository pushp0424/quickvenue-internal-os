'use client'

import { Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/auth-provider'
import { useDepartments } from '@/features/employee-profile/hooks/use-employee-profile'
import { useCities } from '@/features/b2b/hooks/use-b2b-leads'
import { useMyChannels, useEnsureScopedChannels } from '@/features/chat/hooks/use-chat'
import { ChannelList } from '@/features/chat/components/channel-list'
import { MessageThread } from '@/features/chat/components/message-thread'
import { MessageSquare } from 'lucide-react'
import { PageSkeleton } from '@/components/shared/page-skeleton'

function ChatPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedChannelId = searchParams.get('channel')

  const { data: departments } = useDepartments()
  const { data: cities } = useCities()

  const departmentName = useMemo(
    () => departments?.find((d) => d.id === user?.profile.department_id)?.name,
    [departments, user?.profile.department_id]
  )
  const cityName = useMemo(
    () => cities?.find((c) => c.id === user?.profile.city_id)?.name,
    [cities, user?.profile.city_id]
  )

  useEnsureScopedChannels(
    user ? { team: user.profile.team, department_id: user.profile.department_id, city_id: user.profile.city_id } : undefined,
    { departmentName, cityName }
  )

  const { data: channels, isLoading } = useMyChannels()
  const selectedChannel = (channels ?? []).find((c) => c.id === selectedChannelId) ?? null

  function selectChannel(channelId: string) {
    router.push(`/chat?channel=${channelId}`)
  }

  function goBack() {
    router.push('/chat')
  }

  if (isLoading) return <PageSkeleton />

  return (
    <div className="h-[calc(100vh-8rem)] rounded-xl border overflow-hidden bg-card">
      <div className="grid h-full md:grid-cols-[300px_1fr]">
        <div className={selectedChannelId ? 'hidden md:block h-full' : 'block h-full'}>
          <ChannelList channels={channels ?? []} selectedChannelId={selectedChannelId} onSelect={selectChannel} />
        </div>
        <div className={selectedChannelId ? 'block h-full' : 'hidden md:flex h-full'}>
          {selectedChannel ? (
            <MessageThread channel={selectedChannel} onBack={goBack} />
          ) : (
            <div className="hidden md:flex h-full items-center justify-center flex-col gap-2 text-muted-foreground">
              <MessageSquare className="h-10 w-10 opacity-30" />
              <p className="text-sm">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ChatPageContent />
    </Suspense>
  )
}
