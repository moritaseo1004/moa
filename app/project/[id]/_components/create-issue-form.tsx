'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createIssue } from '@/lib/actions/issues'
import { Button } from '@/components/ui/button'
import { ALL_PRIORITIES, PRIORITY_LABELS } from '@/lib/priority'

export function CreateIssueForm({ projectId }: { projectId: string }) {
  const [state, action, isPending] = useActionState(createIssue, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state === null && !isPending) {
      formRef.current?.reset()
    }
  }, [state, isPending])

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <input type="hidden" name="project_id" value={projectId} />
      <div>
        <input
          name="title"
          placeholder="Issue title"
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground"
        />
      </div>
      <div>
        <textarea
          name="description"
          placeholder="Description (optional)"
          rows={2}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground resize-none"
        />
      </div>
      <div className="flex gap-3">
        <select
          name="priority"
          defaultValue="medium"
          className="rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 text-muted-foreground"
        >
          {ALL_PRIORITIES.map((p) => (
            <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
          ))}
        </select>
        <input
          name="due_date"
          type="date"
          className="rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 text-muted-foreground"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? 'Creating…' : 'Create issue'}
      </Button>
    </form>
  )
}
