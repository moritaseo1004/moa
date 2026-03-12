'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { createIssue } from '@/lib/actions/issues'
import { Button } from '@/components/ui/button'
import { ALL_PRIORITIES, PRIORITY_LABELS } from '@/lib/priority'
import { formatBytes } from '@/lib/utils'

interface SelectedFile {
  file: File
  previewUrl: string | null // only set for images
}

export function CreateIssueModal({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<{ error?: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
  const formRef = useRef<HTMLFormElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Focus first input when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => firstInputRef.current?.focus(), 50)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleClose() {
    setOpen(false)
    setState(null)
    revokeAndClear()
    formRef.current?.reset()
  }

  function revokeAndClear() {
    setSelectedFiles((prev) => {
      prev.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl))
      return []
    })
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files ?? [])
    if (!newFiles.length) return
    const entries: SelectedFile[] = newFiles.map((file) => ({
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }))
    setSelectedFiles((prev) => [...prev, ...entries])
    // Reset so the same file can be re-selected if removed
    e.target.value = ''
  }

  function removeFile(idx: number) {
    setSelectedFiles((prev) => {
      const target = prev[idx]
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((_, i) => i !== idx)
    })
  }

  function handleSubmit(e: React.BaseSyntheticEvent) {
    e.preventDefault()
    const formData = new FormData(formRef.current!)
    selectedFiles.forEach(({ file }) => formData.append('attachments', file))

    startTransition(async () => {
      const result = await createIssue(null, formData)
      setState(result)
      if (result === null) {
        handleClose()
      }
    })
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        New issue
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative z-10 w-full max-w-md rounded-xl border border-border bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">New issue</h2>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="p-5 space-y-4">
              <input type="hidden" name="project_id" value={projectId} />

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Title <span className="text-destructive">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  name="title"
                  placeholder="Issue title"
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Add a description…"
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Priority
                  </label>
                  <select
                    name="priority"
                    defaultValue="medium"
                    className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
                  >
                    {ALL_PRIORITIES.map((p) => (
                      <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Due date
                  </label>
                  <input
                    name="due_date"
                    type="date"
                    className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 text-muted-foreground"
                  />
                </div>
              </div>

              {/* Attachments */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Attachments
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add files
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {selectedFiles.map((sf, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2 py-1.5"
                      >
                        {sf.previewUrl ? (
                          // Image thumbnail
                          <img
                            src={sf.previewUrl}
                            alt={sf.file.name}
                            className="h-8 w-8 shrink-0 rounded object-cover"
                          />
                        ) : sf.file.type.startsWith('video/') ? (
                          // Video icon
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.656v6.688a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                            </svg>
                          </span>
                        ) : (
                          // File icon
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium">{sf.file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatBytes(sf.file.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {state?.error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {state.error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? 'Creating…' : 'Create issue'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
