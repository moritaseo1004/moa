'use client'

import { useActionState, useState } from 'react'
import { LinkifiedText } from '@/components/linkified-text'
import { MentionTextarea } from '@/components/mention-textarea'
import { InlineSpinner } from '@/components/ui/inline-spinner'
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
          <LinkifiedText
            text={issue.description}
            className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap break-words"
          />
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
    <form action={action} className="space-y-4 rounded-2xl border border-border bg-card/40 p-4 shadow-[0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-sm">
      <input type="hidden" name="id" value={issue.id} />
      <input type="hidden" name="project_id" value={issue.project_id} />
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Issue title</p>
        <input
          name="title"
          defaultValue={issue.title}
          required
          autoFocus
          className="w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-2.5 text-sm font-semibold outline-none transition-colors focus:border-ring/70 focus:ring-2 focus:ring-ring/30"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Description</p>
          <p className="text-xs text-muted-foreground">Drag the lower-right corner to resize</p>
        </div>
        <MentionTextarea
          name="description"
          defaultValue={issue.description ?? ''}
          rows={8}
          placeholder="Description (optional)"
          className="issue-description-resize min-h-56 w-full rounded-xl border border-border/80 bg-background/80 px-3.5 py-3 text-sm leading-6 outline-none transition-colors focus:border-ring/70 focus:ring-2 focus:ring-ring/30 placeholder:text-muted-foreground resize-y shadow-inner shadow-black/5"
          hintClassName="px-1"
        />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <div className="flex items-center gap-2 pt-1">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? <InlineSpinner className="h-4 w-4" /> : null}
          {isPending ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
