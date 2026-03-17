'use client'

import { useRef, useState, useTransition } from 'react'
import { uploadAttachmentsToIssue } from '@/lib/actions/attachments'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 10 * 1024 * 1024

export function AttachmentDropzone({ issueId }: { issueId: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function submitFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) => file.size > 0)
    if (files.length === 0) return

    const oversized = files.find((file) => file.size > MAX_FILE_SIZE)
    if (oversized) {
      setError(`${oversized.name} exceeds the 10MB limit.`)
      return
    }

    setError(null)

    const formData = new FormData()
    files.forEach((file) => formData.append('attachments', file))

    startTransition(async () => {
      const result = await uploadAttachmentsToIssue(issueId, formData)
      if (result?.error) setError(result.error)
    })
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) submitFiles(event.target.files)
    event.target.value = ''
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    if (!isDragging) setIsDragging(true)
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    setIsDragging(false)
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (event.dataTransfer.files?.length) submitFiles(event.dataTransfer.files)
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'rounded-xl border border-dashed px-4 py-4 transition-colors',
          'cursor-pointer bg-muted/20 hover:border-primary/50 hover:bg-muted/35',
          isDragging && 'border-primary bg-primary/5',
          isPending && 'pointer-events-none opacity-70',
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">
              {isPending ? 'Uploading files…' : 'Drag & drop files here'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              or click to browse. Images, videos, and documents up to 10MB.
            </p>
          </div>
          <span className="shrink-0 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground">
            Browse files
          </span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
