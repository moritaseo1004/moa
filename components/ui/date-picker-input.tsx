'use client'

import { useId, useMemo, useState } from 'react'
import { CalendarDays, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DatePickerInputProps {
  name?: string
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  required?: boolean
  disabled?: boolean
  className?: string
  displayClassName?: string
  placeholder?: string
}

export function DatePickerInput({
  name,
  value,
  defaultValue,
  onValueChange,
  required,
  disabled,
  className,
  displayClassName,
  placeholder = 'Select date',
}: DatePickerInputProps) {
  const isControlled = value !== undefined
  const [internal, setInternal] = useState((defaultValue ?? '') as string)
  const inputId = useId()

  const current = isControlled ? (value ?? '') : internal
  const hasValue = current.length > 0

  const displayText = useMemo(() => {
    if (!hasValue) return placeholder
    const parsed = new Date(`${current}T00:00:00`)
    if (Number.isNaN(parsed.getTime())) return current
    return new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).format(parsed)
  }, [current, hasValue, placeholder])

  function setValue(next: string) {
    if (!isControlled) setInternal(next)
    onValueChange?.(next || null)
  }

  function openNativePicker() {
    if (disabled) return
    const el = document.getElementById(inputId) as HTMLInputElement | null
    if (!el) return
    if (typeof el.showPicker === 'function') {
      el.showPicker()
    } else {
      el.focus()
      el.click()
    }
  }

  return (
    <div className={cn('relative', className)}>
      <input
        id={inputId}
        name={name}
        type="date"
        value={current}
        onChange={(e) => setValue(e.target.value)}
        required={required}
        disabled={disabled}
        style={{ colorScheme: 'dark' }}
        className="absolute left-0 top-0 h-0 w-0 opacity-0 pointer-events-none"
      />

      <button
        type="button"
        onClick={openNativePicker}
        disabled={disabled}
        className={cn(
          'h-9 w-full rounded-lg border border-border bg-background px-2.5 pr-9 text-sm',
          'inline-flex items-center gap-2 text-muted-foreground',
          displayClassName,
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <CalendarDays className="h-4 w-4 shrink-0" />
        <span className={cn('truncate', !hasValue && 'opacity-70')}>{displayText}</span>
      </button>

      {hasValue && !disabled && (
        <button
          type="button"
          aria-label="Clear date"
          onClick={(e) => {
            e.stopPropagation()
            setValue('')
          }}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
