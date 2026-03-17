'use client'

import { createPortal } from 'react-dom'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormSelectOption {
  value: string
  label: string
  muted?: boolean
}

export function FormSelectField({
  name,
  options,
  defaultValue = '',
  placeholder,
  className,
}: {
  name: string
  options: FormSelectOption[]
  defaultValue?: string
  placeholder?: string
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(defaultValue)
  const [panelStyle, setPanelStyle] = useState<{ top: number; left: number; width: number } | null>(null)

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  )

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (!containerRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setOpen(false)
      }
    }

    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [])

  useEffect(() => {
    const form = containerRef.current?.closest('form')
    if (!form) return

    function handleReset() {
      setValue(defaultValue)
      setOpen(false)
    }

    form.addEventListener('reset', handleReset)
    return () => form.removeEventListener('reset', handleReset)
  }, [defaultValue])

  useEffect(() => {
    if (!open) return

    function updatePosition() {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return

      setPanelStyle({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open])

  function handleSelect(nextValue: string) {
    setValue(nextValue)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className={cn('relative w-full min-w-0', className)}>
      <input type="hidden" name={name} value={value} />

      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex h-10 w-full min-w-0 items-center justify-between rounded-md border border-border bg-[#1f1f1f] px-3 text-left text-sm transition-colors',
          'hover:bg-[#232323] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30',
          open && 'bg-[#232323]',
        )}
      >
        <span className="min-w-0 flex-1 overflow-hidden pr-2">
          {selected ? (
            <span className={cn('block truncate', selected.muted && 'text-muted-foreground')}>
              {selected.label}
            </span>
          ) : (
            <span className="block truncate text-muted-foreground">{placeholder ?? 'Select an option'}</span>
          )}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && panelStyle && typeof document !== 'undefined'
        ? createPortal(
            <div
              ref={panelRef}
              className="z-[80] overflow-hidden rounded-lg border border-border bg-[#1f1f1f] p-1.5 shadow-2xl"
              style={{
                position: 'fixed',
                top: panelStyle.top,
                left: panelStyle.left,
                width: panelStyle.width,
              }}
            >
              <div className="space-y-1">
                {options.map((option) => {
                  const isSelected = option.value === value

                  return (
                    <button
                      key={`${name}-${option.value}`}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        'flex w-full min-w-0 items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors',
                        isSelected
                          ? 'bg-[#232323] text-foreground'
                          : 'text-muted-foreground hover:bg-[#232323] hover:text-foreground',
                      )}
                    >
                      <span className={cn('min-w-0 flex-1 truncate pr-2', option.muted && !isSelected && 'text-muted-foreground')}>
                        {option.label}
                      </span>
                      {isSelected ? <Check className="h-4 w-4 text-primary" /> : null}
                    </button>
                  )
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
