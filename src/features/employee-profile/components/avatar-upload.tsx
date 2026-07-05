'use client'

import { useRef, useState } from 'react'
import { useUploadAvatar } from '@/features/employee-profile/hooks/use-employee-profile'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

interface Props {
  profileId: string
  fullName: string
  avatarUrl: string | null
  editable: boolean
}

export function AvatarUpload({ profileId, fullName, avatarUrl, editable }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const uploadAvatar = useUploadAvatar()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadAvatar.mutateAsync({ profileId, file })
      toast.success('Photo updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload photo')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="relative shrink-0">
      <Avatar className="h-16 w-16">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
        <AvatarFallback className="text-lg font-bold bg-[#0244C6] text-white">
          {initials(fullName)}
        </AvatarFallback>
      </Avatar>
      {editable && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#0244C6] text-white flex items-center justify-center shadow hover:bg-[#012775] transition-colors"
            title="Change photo"
          >
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  )
}
