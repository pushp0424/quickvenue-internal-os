'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Copy, Check, ShieldAlert } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
  password: string
}

export function CredentialsDialog({ open, onOpenChange, email, password }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Login Credentials</DialogTitle>
          <DialogDescription>
            Share these with the employee directly. For security, this password won&apos;t be shown again.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4 space-y-3 font-mono text-sm">
          <div>
            <p className="text-xs text-muted-foreground font-sans">Email</p>
            <p>{email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-sans">Password</p>
            <p>{password}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
          <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>Make sure to copy this now — it can&apos;t be retrieved later, only reset to a new one.</span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCopy} className="gap-2">
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button onClick={() => onOpenChange(false)} className="bg-[#0244C6] hover:bg-[#012775]">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
