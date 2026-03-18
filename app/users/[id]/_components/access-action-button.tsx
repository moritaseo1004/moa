'use client'

import { useTransition } from 'react'
import { InlineSpinner } from '@/components/ui/inline-spinner'

export function AccessActionButton({
  action,
  idleLabel,
  pendingLabel,
}: {
  action: () => Promise<void>
  idleLabel: string
  pendingLabel: string
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await action()
        })
      }}
      className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? <InlineSpinner className="h-4 w-4" /> : null}
      {isPending ? pendingLabel : idleLabel}
    </button>
  )
}
