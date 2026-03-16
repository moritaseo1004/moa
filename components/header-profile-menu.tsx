'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { LogOut, Settings } from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'

function getInitials(label: string) {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function HeaderProfileMenu({
  name,
  email,
  roleLabel,
}: {
  name: string
  email?: string | null
  roleLabel?: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const initials = useMemo(() => getInitials(name || 'U'), [name])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className={cn(
          'inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-[#1f1f1f] transition-colors hover:bg-[#232323]',
          open && 'bg-[#232323]',
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-primary/15 text-xs font-semibold text-primary">
          {initials}
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 top-12 min-w-[220px] rounded-lg border border-border bg-[#1f1f1f] p-2 shadow-2xl">
          <div className="border-b border-border px-3 pb-2 pt-1">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            {email ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{email}</p>
            ) : null}
            {roleLabel ? (
              <span className="mt-2 inline-flex rounded-sm border border-border bg-[#202020] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-primary">
                {roleLabel}
              </span>
            ) : null}
          </div>

          <div className="mt-2 space-y-1">
            <Link
              href="/settings"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>

            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
