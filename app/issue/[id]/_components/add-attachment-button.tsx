'use client'

import { useRef, useTransition } from 'react'
import { InlineSpinner } from '@/components/ui/inline-spinner'
import { uploadAttachmentsToIssue } from '@/lib/actions/attachments'

export function AddAttachmentButton({ issueId }: { issueId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const formData = new FormData()
    Array.from(files).forEach((f) => formData.append('attachments', f))
    e.target.value = ''

    startTransition(async () => {
      await uploadAttachmentsToIssue(issueId, formData)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isPending}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <>
            <InlineSpinner className="h-3.5 w-3.5" />
            Uploading…
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add files
          </>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
      />
    </>
  )
}
