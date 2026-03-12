'use client'

import { useState, useTransition } from 'react'
import { deleteAttachment } from '@/lib/actions/attachments'

export function DeleteAttachmentButton({
  attachmentId,
  fileUrl,
  issueId,
}: {
  attachmentId: string
  fileUrl: string
  issueId: string
}) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deleteAttachment(attachmentId, fileUrl, issueId)
    })
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs text-destructive hover:underline disabled:opacity-50"
        >
          삭제
        </button>
        <button
          onClick={() => setConfirm(false)}
          disabled={isPending}
          className="text-xs text-muted-foreground hover:underline disabled:opacity-50"
        >
          취소
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirm(true)}
      className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
      aria-label="Delete attachment"
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  )
}
