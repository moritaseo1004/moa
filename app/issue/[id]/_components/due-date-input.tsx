'use client'

import { useTransition } from 'react'
import { updateIssueDueDate } from '@/lib/actions/issues'
import { cn } from '@/lib/utils'

export function DueDateInput({
  issueId,
  projectId,
  current,
}: {
  issueId: string
  projectId: string
  current: string | null
}) {
  const [isPending, startTransition] = useTransition()

  const today = new Date().toISOString().slice(0, 10)
  const isOverdue = current && current < today
  const isToday = current && current === today

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value || null
    startTransition(() => {
      updateIssueDueDate(issueId, val, projectId)
    })
  }

  return (
    <input
      type="date"
      defaultValue={current ?? ''}
      onChange={handleChange}
      disabled={isPending}
      className={cn(
        'w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring/50 transition-opacity',
        isPending && 'opacity-50',
        isOverdue && 'text-red-500',
        isToday && !isOverdue && 'text-amber-500',
      )}
    />
  )
}
