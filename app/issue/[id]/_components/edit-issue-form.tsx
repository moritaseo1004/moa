'use client'

import { useActionState, useState } from 'react'
import { updateIssue } from '@/lib/actions/issues'
import { Button } from '@/components/ui/button'
import type { IssueWithRelations } from '@/lib/types'

export function EditIssueForm({ issue }: { issue: IssueWithRelations }) {
  const [editing, setEditing] = useState(false)
  const [state, action, isPending] = useActionState(async (prevState: { error?: string } | null, formData: FormData) => {
    const result = await updateIssue(prevState, formData)
    if (!result) setEditing(false)
    return result
  }, null)

  if (!editing) {
    return (
      <div
        className="group cursor-pointer rounded-lg p-3 -mx-3 hover:bg-muted/50 transition-colors"
        onClick={() => setEditing(true)}
      >
        <h1 className="text-lg font-semibold">{issue.title}</h1>
        {issue.description ? (
          <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{issue.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground/50 mt-2 italic">Add a description…</p>
        )}
        <p className="text-xs text-muted-foreground mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to edit
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={issue.id} />
      <input type="hidden" name="project_id" value={issue.project_id} />
      <input
        name="title"
        defaultValue={issue.title}
        required
        autoFocus
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring/50"
      />
      <textarea
        name="description"
        defaultValue={issue.description ?? ''}
        rows={4}
        placeholder="Description (optional)"
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground resize-none"
      />
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
