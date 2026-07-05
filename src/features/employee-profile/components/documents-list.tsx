'use client'

import { useRef, useState } from 'react'
import {
  useEmployeeDocuments, useUploadEmployeeDocument,
  useDocumentSignedUrl, useDeleteEmployeeDocument,
} from '@/features/employee-profile/hooks/use-employee-profile'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { FileText, Download, Trash2, Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const DOCUMENT_TYPES = ['aadhaar', 'pan', 'offer_letter', 'resume', 'other']

interface Props {
  profileId: string
  canManage: boolean
}

export function DocumentsList({ profileId, canManage }: Props) {
  const { data: documents, isLoading } = useEmployeeDocuments(profileId, canManage)
  const uploadDocument = useUploadEmployeeDocument()
  const getSignedUrl = useDocumentSignedUrl()
  const deleteDocument = useDeleteEmployeeDocument()
  const inputRef = useRef<HTMLInputElement>(null)
  const [docType, setDocType] = useState('resume')
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadDocument.mutateAsync({ profileId, documentType: docType, file })
      toast.success('Document uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload document')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDownload(filePath: string) {
    try {
      const url = await getSignedUrl.mutateAsync(filePath)
      window.open(url, '_blank')
    } catch {
      toast.error('Failed to generate download link')
    }
  }

  async function handleDelete(id: string, filePath: string) {
    try {
      await deleteDocument.mutateAsync({ id, filePath, profileId })
      toast.success('Document removed')
    } catch {
      toast.error('Failed to remove document')
    }
  }

  if (!canManage) return null

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Documents</h2>
          <div className="flex items-center gap-2">
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger className="w-[140px] h-8"><SelectValue /></SelectTrigger>
              <SelectContent position="popper">
                {DOCUMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="gap-1.5 bg-[#0244C6] hover:bg-[#012775]" onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Upload
            </Button>
            <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} />
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : !documents || documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
        ) : (
          <div className="divide-y">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 py-3">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.file_name}</p>
                  <p className="text-xs text-muted-foreground">{doc.document_type.replace(/_/g, ' ')}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(doc.file_path)} title="Download">
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => handleDelete(doc.id, doc.file_path)} title="Remove">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
