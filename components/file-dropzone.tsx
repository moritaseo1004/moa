'use client'

import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export function FileDropzone({
  onFilesSelected,
  disabled = false,
  title = 'Drag & drop files here',
  description = 'or click to browse. Images, videos, and documents up to 10MB.',
}: {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
  title?: string
  description?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []).filter((file) => file.size > 0)
    if (files.length === 0) return
    onFilesSelected(files)
  }

  return (
    <>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (disabled) return
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(event) => {
          if (disabled) return
          event.preventDefault()
          if (!isDragging) setIsDragging(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
          setIsDragging(false)
        }}
        onDrop={(event) => {
          if (disabled) return
          event.preventDefault()
          setIsDragging(false)
          handleFiles(event.dataTransfer.files)
        }}
        className={cn(
          'rounded-xl border border-dashed px-4 py-4 transition-colors',
          'cursor-pointer bg-muted/20 hover:border-primary/50 hover:bg-muted/35',
          isDragging && 'border-primary bg-primary/5',
          disabled && 'pointer-events-none opacity-70',
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
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
        onChange={(event) => {
          handleFiles(event.target.files)
          event.target.value = ''
        }}
      />
    </>
  )
}
