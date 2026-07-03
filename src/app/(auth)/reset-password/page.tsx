'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/services/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Exchange the code in URL for a session
    const supabase = createClient()
    const code = new URLSearchParams(window.location.search).get('code')

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setError('Reset link is invalid or expired. Please request a new one.')
        } else {
          setReady(true)
        }
      })
    } else {
      setReady(true)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      router.push('/sign-in')
    } catch (err: any) {
      setError(err?.message ?? 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.97)',
      borderRadius: '16px',
      padding: '40px',
      boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
      width: '100%',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#012775', margin: 0 }}>
          Set New Password
        </h2>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '4px' }}>
          Choose a strong password
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            New Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            minLength={8}
            required
            disabled={!ready}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.875rem',
              outline: 'none',
              boxSizing: 'border-box',
              color: '#111827',
              opacity: ready ? 1 : 0.5,
            }}
          />
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#dc2626',
            fontSize: '0.875rem',
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !ready}
          style={{
            width: '100%',
            padding: '12px',
            background: loading || !ready ? '#6b7280' : '#0244C6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: loading || !ready ? 'not-allowed' : 'pointer',
          }}
        >
          {!ready ? 'Verifying link...' : loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  )
}