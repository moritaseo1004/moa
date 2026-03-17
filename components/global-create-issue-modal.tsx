'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createIssue } from '@/lib/actions/issues'
import { getProjectsAction } from '@/lib/actions/projects'
import { listMentionableUsers } from '@/lib/actions/users'
import { FormSelectField } from '@/components/form-select-field'
import { Button } from '@/components/ui/button'
import { DatePickerInput } from '@/components/ui/date-picker-input'
import { FileDropzone } from '@/components/file-dropzone'
import { getTodayYmd } from '@/lib/date-utils'
import { MentionTextarea } from '@/components/mention-textarea'
import { ALL_PRIORITIES, PRIORITY_LABELS } from '@/lib/priority'
import { formatBytes } from '@/lib/utils'
import type { Project } from '@/lib/types'

interface SelectedFile {
  file: File
  previewUrl: string | null
}

interface AssignableUser {
  id: string
  name: string
}

export function GlobalCreateIssueModal() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<AssignableUser[]>([])
  const [state, setState] = useState<{ error?: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [startDateValue, setStartDateValue] = useState<string | null>(getTodayYmd())
  const [dueDateValue, setDueDateValue] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function revokeAndClear() {
    setSelectedFiles((prev) => {
      prev.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl))
      return []
    })
  }

  function handleClose() {
    setOpen(false)
    setState(null)
    setSelectedProjectId('')
    setStartDateValue(getTodayYmd())
    setDueDateValue(null)
    revokeAndClear()
    formRef.current?.reset()
  }

  // Global shortcut: Shift + N
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if ((e.target as HTMLElement).isContentEditable) return
      if (!e.ctrlKey && !e.metaKey && !e.altKey && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        setSelectedProjectId('')
        setStartDateValue(getTodayYmd())
        setDueDateValue(null)
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Load projects when modal opens
  useEffect(() => {
    if (!open) return
    Promise.all([getProjectsAction(), listMentionableUsers()])
      .then(([projectData, userData]) => {
        setProjects(projectData)
        setUsers(userData)
      })
      .catch(() => {
        setProjects([])
        setUsers([])
      })
    setTimeout(() => firstInputRef.current?.focus(), 50)
  }, [open])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') handleClose()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onOpenWithPreset(event: Event) {
      const customEvent = event as CustomEvent<{ dueDate?: string | null }>
      setSelectedProjectId('')
      setStartDateValue(getTodayYmd())
      setDueDateValue(customEvent.detail?.dueDate ?? null)
      setOpen(true)
    }

    window.addEventListener('moa:create-issue', onOpenWithPreset)
    return () => window.removeEventListener('moa:create-issue', onOpenWithPreset)
  }, [])

  function addFiles(newFiles: File[]) {
    if (!newFiles.length) return
    const entries: SelectedFile[] = newFiles.map((file) => ({
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }))
    setSelectedFiles((prev) => [...prev, ...entries])
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files ?? []))
    e.target.value = ''
  }

  function handleDescriptionPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const imageFiles = Array.from(e.clipboardData.items)
      .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
      .map((item) => item.getAsFile())
      .filter((file): file is File => Boolean(file))

    if (!imageFiles.length) return

    const entries: SelectedFile[] = imageFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }))
    setSelectedFiles((prev) => [...prev, ...entries])
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
        router.replace(pathname)
        router.refresh()
        handleClose()
      }
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[min(1100px,96vw)] overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-base font-semibold">New issue</h2>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="dashboard-scroll max-h-[calc(94vh-72px)] space-y-5 overflow-y-auto p-6"
        >
          {/* Project selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Project <span className="text-destructive">*</span>
            </label>
            <select
              name="project_id"
              required
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:ring-0"
            >
              <option value="">Select a project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-3 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
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

          <div>
            <label className="mb-3 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Description
            </label>
            <MentionTextarea
              name="description"
              placeholder="Add a description…"
              rows={10}
              onPaste={handleDescriptionPaste}
              className="min-h-56 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground resize-y"
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="mb-3 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Assignee
              </label>
              <FormSelectField
                name="assignee_id"
                defaultValue=""
                options={[
                  { value: '', label: 'Unassigned', muted: true },
                  ...users.map((user) => ({ value: user.id, label: user.name })),
                ]}
              />
            </div>

            <div>
              <label className="mb-3 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Priority
              </label>
              <FormSelectField
                name="priority"
                defaultValue="medium"
                options={ALL_PRIORITIES.map((priority) => ({
                  value: priority,
                  label: PRIORITY_LABELS[priority],
                }))}
              />
            </div>

            <div>
              <label className="mb-3 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Start date
              </label>
              <DatePickerInput
                name="start_date"
                value={startDateValue}
                onValueChange={setStartDateValue}
                className="w-full"
                placeholder="Start date"
              />
            </div>

            <div>
              <label className="mb-3 block text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Due date
              </label>
              <DatePickerInput
                name="due_date"
                value={dueDateValue}
                onValueChange={setDueDateValue}
                className="w-full"
                placeholder="Due date"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Start date and due date are optional.
          </p>

          {/* Attachments */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Attachments
                <span className="ml-2 normal-case font-normal opacity-60">최대 10MB</span>
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

            <FileDropzone onFilesSelected={addFiles} disabled={isPending} />

            {selectedFiles.length > 0 && (
              <ul className="dashboard-scroll max-h-56 space-y-1.5 overflow-y-auto pr-1">
                {selectedFiles.map((sf, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2 py-1.5"
                  >
                    {sf.previewUrl ? (
                      <Image
                        src={sf.previewUrl}
                        alt={sf.file.name}
                        width={32}
                        height={32}
                        unoptimized
                        className="h-8 w-8 shrink-0 rounded object-cover"
                      />
                    ) : sf.file.type.startsWith('video/') ? (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.656v6.688a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                        </svg>
                      </span>
                    ) : (
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
            <Button type="button" variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? 'Creating…' : 'Create issue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
