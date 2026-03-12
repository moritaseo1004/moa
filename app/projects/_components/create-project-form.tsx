'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createProject } from '@/lib/actions/projects'
import { Button } from '@/components/ui/button'

export function CreateProjectForm() {
  const [state, action, isPending] = useActionState(createProject, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state === null && !isPending) {
      formRef.current?.reset()
    }
  }, [state, isPending])

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <div>
        <input
          name="name"
          placeholder="Project name"
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
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" disabled={isPending} size="sm">
        {isPending ? 'Creating…' : 'Create project'}
      </Button>
    </form>
  )
}
