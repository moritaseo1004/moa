'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteIssue } from '@/lib/actions/issues'
import { Button } from '@/components/ui/button'
import { InlineSpinner } from '@/components/ui/inline-spinner'

export function DeleteIssueButton({
  issueId,
  projectId,
  label,
  returnHref,
}: {
  issueId: string
  projectId: string
  label?: string
  returnHref?: string
}) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    startTransition(async () => {
      await deleteIssue(issueId, projectId)
      router.push(returnHref ?? `/project/${projectId}`)
    })
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">삭제할까요?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs text-destructive hover:underline disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-1">
            {isPending ? <InlineSpinner className="h-3.5 w-3.5" /> : null}
            확인
          </span>
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
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setConfirm(true)}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
      {label ? <span>{label}</span> : null}
    </Button>
  )
}
