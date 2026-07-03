'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/services/supabase/client'
import { AuthUser } from '@/types/auth.types'
import { RoleName } from '@/types/auth.types'

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  refresh: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session?.user) {
        setUser(null)
        return
      }

      const [profileResult, rolesResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('user_roles').select('roles(name)').eq('user_id', session.user.id),
      ])

      if (profileResult.error || !profileResult.data) {
        setUser(null)
        return
      }

      const roles = (rolesResult.data ?? [])
        .map((r: any) => r.roles?.name)
        .filter(Boolean) as RoleName[]

      setUser({ profile: profileResult.data, roles })
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()

    // Listen to auth changes — don't call refresh on load
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null)
        setLoading(false)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        refresh()
      }
    })

    // Check existing session silently
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        refresh()
      } else {
        setLoading(false)
      }
    }).catch(() => {
      setLoading(false)
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