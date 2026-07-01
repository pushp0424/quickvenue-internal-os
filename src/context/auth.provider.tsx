'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/services/supabase/client'
import { getCurrentAuthUser } from '@/features/auth/services/auth.service'
import { AuthUser } from '@/types/auth.types'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const authUser = await getCurrentAuthUser()
    setUser(authUser)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    const supabase = createClient()
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      refresh()
    })
    return () => listener.subscription.unsubscribe()
  }, [refresh])

  return (
    <AuthContext.Provider value={{ user, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}