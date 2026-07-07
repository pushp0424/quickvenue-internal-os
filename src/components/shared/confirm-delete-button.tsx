'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  description: string
  onConfirm: () => Promise<void>
  /** Custom trigger element. Defaults to a small outline "Delete" button. */
  trigger?: React.ReactNode
  /** Render just a ghost trash icon instead of the labelled button. */
  iconOnly?: boolean
  label?: string
  className?: string
}

export function ConfirmDeleteButton({
  title, description, onConfirm, trigger, iconOnly, label = 'Delete', className,
}: Props) {
  const [deleting, setDeleting] = useState(false)

  async function handleConfirm() {
    setDeleting(true)
    try {
      await onConfirm()
    } finally {
      setDeleting(false)
    }
  }

  const defaultTrigger = iconOnly ? (
    <Button
      variant="ghost" size="icon"
      className={cn('h-7 w-7 text-muted-foreground hover:text-red-600', className)}
      title={label}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  ) : (
    <Button
      variant="outline" size="sm"
      className={cn('gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950', className)}
    >
      <Trash2 className="h-3.5 w-3.5" />
      {label}
    </Button>
  )

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger ?? defaultTrigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); handleConfirm() }}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
