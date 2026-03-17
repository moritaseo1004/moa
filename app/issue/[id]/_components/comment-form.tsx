'use client'

import { useActionState, useEffect, useRef } from 'react'
import { addComment } from '@/lib/actions/comments'
import { Button } from '@/components/ui/button'
import { InlineSpinner } from '@/components/ui/inline-spinner'

export function CommentForm({ issueId }: { issueId: string }) {
  const [state, action, isPending] = useActionState(addComment, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state === null && !isPending) {
      formRef.current?.reset()
    }
  }, [state, isPending])

  return (
    <form ref={formRef} action={action} className="space-y-2">
      <input type="hidden" name="issue_id" value={issueId} />
      <textarea
        name="content"
        placeholder="Write a comment…"
        rows={3}
        required
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground resize-none"
      />
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? <InlineSpinner className="h-4 w-4" /> : null}
        {isPending ? 'Posting…' : 'Post comment'}
      </Button>
    </form>
  )
}
