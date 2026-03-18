'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createIssue } from '@/lib/actions/issues'
import { listAssignableUsers } from '@/lib/actions/users'
import { FormSelectField } from '@/components/form-select-field'
import { Button } from '@/components/ui/button'
import { DatePickerInput } from '@/components/ui/date-picker-input'
import { FileDropzone } from '@/components/file-dropzone'
import { MentionTextarea } from '@/components/mention-textarea'
import { InlineSpinner } from '@/components/ui/inline-spinner'
import { getTodayYmd } from '@/lib/date-utils'
import { ALL_PRIORITIES, PRIORITY_LABELS } from '@/lib/priority'
import { formatBytes } from '@/lib/utils'

interface SelectedFile {
  file: File
  previewUrl: string | null
}

interface AssignableUser {
  id: string
  name: string
}

export function CreateIssueForm({ projectId }: { projectId: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [state, setState] = useState<{ error?: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([])
  const [users, setUsers] = useState<AssignableUser[]>([])
  const [startDateValue, setStartDateValue] = useState<string | null>(getTodayYmd())
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    listAssignableUsers().then(setUsers).catch(() => setUsers([]))
  }, [])

  function revokeAndClear() {
    setSelectedFiles((prev) => {
      prev.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl))
      return []
    })
  }

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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(formRef.current!)
    selectedFiles.forEach(({ file }) => formData.append('attachments', file))

    startTransition(async () => {
      const result = await createIssue(null, formData)
      setState(result)
      if (result === null) {
        formRef.current?.reset()
        setStartDateValue(getTodayYmd())
        revokeAndClear()
        router.replace(pathname)
        router.refresh()
      }
    })
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
      <input type="hidden" name="project_id" value={projectId} />
      <div>
        <input
          name="title"
          placeholder="Issue title"
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground"
        />
      </div>
      <MentionTextarea
        name="description"
        placeholder="Description (optional)"
        rows={2}
        onPaste={handleDescriptionPaste}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground resize-none"
      />
      <div className="flex gap-3">
        <FormSelectField
          name="assignee_id"
          defaultValue=""
          options={[
            { value: '', label: 'Unassigned', muted: true },
            ...users.map((user) => ({ value: user.id, label: user.name })),
          ]}
          className="w-[170px]"
        />
        <FormSelectField
          name="priority"
          defaultValue="medium"
          options={ALL_PRIORITIES.map((priority) => ({
            value: priority,
            label: PRIORITY_LABELS[priority],
          }))}
          className="w-[170px]"
        />
        <DatePickerInput
          name="start_date"
          value={startDateValue}
          onValueChange={setStartDateValue}
          className="w-[170px]"
          placeholder="Start date"
        />
        <DatePickerInput
          name="due_date"
          className="w-[170px]"
          placeholder="Due date"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Paste images into description, mention teammates with @, or add files.</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
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

        {selectedFiles.length > 0 ? (
          <ul className="space-y-1.5">
            {selectedFiles.map((sf, idx) => (
              <li
                key={`${sf.file.name}-${idx}`}
                className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-2 py-1.5"
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
                  className="text-muted-foreground transition-colors hover:text-destructive"
                  aria-label="Remove"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">Start date and due date are optional.</p>
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? <InlineSpinner className="h-4 w-4" /> : null}
        {isPending ? 'Creating…' : 'Create issue'}
      </Button>
    </form>
  )
}
