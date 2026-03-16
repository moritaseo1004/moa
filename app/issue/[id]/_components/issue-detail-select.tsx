'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface IssueDetailSelectOption {
  value: string
  label: string
  dotClassName?: string
  badgeClassName?: string
  muted?: boolean
}

export function IssueDetailSelect({
  value,
  options,
  onChange,
  disabled,
  placeholder,
}: {
  value: string
  options: IssueDetailSelectOption[]
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  )

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [])

  function handleSelect(next: string) {
    setOpen(false)
    if (next !== value) onChange(next)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-border bg-[#1f1f1f] px-3 text-left text-sm transition-colors',
          'hover:bg-[#232323] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30',
          disabled && 'cursor-not-allowed opacity-50',
          open && 'bg-[#232323]',
        )}
      >
        <span className="min-w-0">
          {selected ? (
            <span
              className={cn(
                'inline-flex max-w-full items-center gap-2 rounded-md px-2 py-0.5 text-sm',
                selected.badgeClassName ?? 'bg-transparent px-0 py-0',
                selected.muted && 'text-muted-foreground',
              )}
            >
              {selected.dotClassName ? (
                <span className={cn('h-2 w-2 rounded-full', selected.dotClassName)} />
              ) : null}
              <span className="truncate">{selected.label}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder ?? 'Select an option'}</span>
          )}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-full overflow-hidden rounded-lg border border-border bg-[#1f1f1f] p-1.5 shadow-2xl">
          <div className="space-y-1">
            {options.map((option) => {
              const selectedOption = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors',
                    selectedOption
                      ? 'bg-[#232323] text-foreground'
                      : 'text-muted-foreground hover:bg-[#232323] hover:text-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex min-w-0 items-center gap-2',
                      option.badgeClassName ? 'rounded-md px-2 py-0.5' : '',
                      option.badgeClassName,
                    )}
                  >
                    {option.dotClassName ? (
                      <span className={cn('h-2 w-2 rounded-full', option.dotClassName)} />
                    ) : null}
                    <span className="truncate">{option.label}</span>
                  </span>
                  {selectedOption ? <Check className="h-4 w-4 text-primary" /> : null}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
