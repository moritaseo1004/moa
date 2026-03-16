'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckSquare2, ChevronDown, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MultiSelectOption {
  value: string
  label: string
}

export function MultiSelectFilter({
  label,
  options,
  selectedValues,
  onApply,
  allLabel = 'All',
}: {
  label: string
  options: MultiSelectOption[]
  selectedValues: string[]
  onApply: (values: string[]) => void
  allLabel?: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<string[]>(selectedValues)

  useEffect(() => {
    setDraft(selectedValues)
  }, [selectedValues])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setDraft(selectedValues)
      }
    }

    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [selectedValues])

  const summary = useMemo(() => {
    if (selectedValues.length === 0) return allLabel
    if (selectedValues.length === 1) {
      return options.find((option) => option.value === selectedValues[0])?.label ?? allLabel
    }
    return `${selectedValues.length} selected`
  }, [allLabel, options, selectedValues])

  function toggleValue(value: string) {
    setDraft((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className={cn(
          'inline-flex h-8 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-sm text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground',
          open && 'bg-[#232323] text-foreground',
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{label}</span>
        <span className="text-foreground">{summary}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      {open ? (
        <div className="absolute left-0 top-10 z-50 min-w-[220px] rounded-lg border border-border bg-[#1f1f1f] p-2 shadow-2xl">
          <p className="px-2 pb-2 text-xs text-muted-foreground">{label}</p>

          <div className="space-y-1">
            {options.map((option) => {
              const checked = draft.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleValue(option.value)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-foreground transition-colors hover:bg-[#232323]"
                >
                  {checked ? (
                    <CheckSquare2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>

          <div className="mt-2 flex items-center justify-end gap-2 border-t border-border pt-2">
            <button
              type="button"
              onClick={() => {
                setDraft([])
                onApply([])
                setOpen(false)
              }}
              className="inline-flex h-8 items-center justify-center rounded-md border border-border bg-transparent px-3 text-sm text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                onApply(draft)
                setOpen(false)
              }}
              className="inline-flex h-8 items-center justify-center rounded-md border border-primary/30 bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Save
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
