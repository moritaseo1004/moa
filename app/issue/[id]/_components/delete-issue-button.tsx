'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteIssue } from '@/lib/actions/issues'
import { Button } from '@/components/ui/button'

export function DeleteIssueButton({
  issueId,
  projectId,
}: {
  issueId: string
  projectId: string
}) {
  const [confirm, setConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    startTransition(async () => {
      await deleteIssue(issueId, projectId)
      router.push(`/project/${projectId}`)
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
          확인
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
    </Button>
  )
}
