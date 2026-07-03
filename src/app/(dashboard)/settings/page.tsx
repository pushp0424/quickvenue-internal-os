'use client'

import { useState } from 'react'
import { useAuth } from '@/context/auth.provider'
import { createClient } from '@/services/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SectionHeader } from '@/components/shared/section-header'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { User, Lock, Bell, Palette, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { Toaster } from 'sonner'

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatRole(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function SettingsPage() {
  const { user, refresh } = useAuth()
  const [fullName, setFullName] = useState(user?.profile.full_name ?? '')
  const [phone, setPhone] = useState(user?.profile.phone ?? '')
  const [designation, setDesignation] = useState(user?.profile.designation ?? '')
  const [saving, setSaving] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

 async function handleProfileSave(e: React.FormEvent) {
  e.preventDefault()
  if (!user) return
  setSaving(true)
  try {
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone, designation })
      .eq('id', user.profile.id)
    if (error) throw error
    await refresh()
    toast.success('Profile updated successfully')
  } catch (err: any) {
    toast.error(err.message ?? 'Failed to update profile')
  } finally {
    setSaving(false)
  }
}

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setChangingPassword(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword('')
      toast.success('Password changed successfully')
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  if (!user) return null

  return (
    <div className="space-y-8 max-w-3xl">
      <Toaster position="top-right" richColors />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account preferences
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-[#0244C6]" />
            <div>
              <CardTitle className="text-base">Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Avatar + role display */}
          <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-muted/50">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-[#0244C6] text-white text-lg font-bold">
                {initials(user.profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{user.profile.full_name}</p>
              <p className="text-sm text-muted-foreground">{user.profile.email}</p>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {user.roles.map((r) => (
                  <Badge key={r} variant="secondary" className="text-xs">
                    {formatRole(r)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={user.profile.email}
                  disabled
                  className="opacity-60"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={user.profile.city ?? ''}
                  disabled
                  className="opacity-60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Senior Sales Executive"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#0244C6] hover:bg-[#012775]"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-[#0244C6]" />
            <div>
              <CardTitle className="text-base">Security</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                minLength={8}
                required
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={changingPassword}
                variant="outline"
              >
                {changingPassword ? 'Changing...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Appearance Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-[#0244C6]" />
            <div>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>Customize how Quick Venue OS looks</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose between light, dark, or system theme
              </p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      {/* Role Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-[#0244C6]" />
            <div>
              <CardTitle className="text-base">Access & Permissions</CardTitle>
              <CardDescription>Your current roles and access level</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {user.roles.map((role) => (
            <div
              key={role}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div>
                <p className="text-sm font-medium">{formatRole(role)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {getRoleDescription(role)}
                </p>
              </div>
              <Badge className="bg-[#0244C6]/10 text-[#0244C6] border-0 text-xs">
                Active
              </Badge>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-2">
            Contact your admin to change role assignments.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function getRoleDescription(role: string): string {
  const descriptions: Record<string, string> = {
    founder: 'Full system access across all modules',
    admin: 'Manage users, teams, and operations',
    city_lead: 'Access limited to assigned city data',
    sales_executive: 'Access to assigned leads and pipeline',
    operations_executive: 'Manage operational workflows',
    venue_acquisition_executive: 'Manage venue onboarding',
    developer: 'Access to developer tools and system info',
    hr: 'Access to employee management modules',
  }
  return descriptions[role] ?? 'Standard access'
}