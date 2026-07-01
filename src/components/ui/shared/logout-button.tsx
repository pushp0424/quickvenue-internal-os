'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/features/auth/services/auth.service'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <Button variant="ghost" onClick={handleLogout} className="gap-2">
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  )
}