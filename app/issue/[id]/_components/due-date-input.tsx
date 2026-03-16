'use client'

import { useState, useTransition } from 'react'
import { updateIssueDueDate } from '@/lib/actions/issues'
import { DatePickerInput } from '@/components/ui/date-picker-input'
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
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const today = new Date().toISOString().slice(0, 10)
  const isOverdue = current && current < today
  const isToday = current && current === today

  function handleChange(val: string | null) {
    setError(null)
    startTransition(async () => {
      const result = await updateIssueDueDate(issueId, val, projectId)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="space-y-1.5">
      <DatePickerInput
        value={current}
        onValueChange={handleChange}
        disabled={isPending}
        className="w-full transition-opacity"
        displayClassName={cn(
          isOverdue && 'text-red-500',
          isToday && !isOverdue && 'text-amber-500',
        )}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
