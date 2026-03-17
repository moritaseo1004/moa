'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import {
  CalendarDays,
  FolderKanban,
  House,
  Inbox,
  PanelLeft,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const RAIL_MODE_KEY = 'moa:left-rail-mode'

type RailMode = 'expanded' | 'collapsed' | 'hover'

function readStoredRailMode(): RailMode {
  if (typeof window === 'undefined') return 'hover'
  const savedMode = window.localStorage.getItem(RAIL_MODE_KEY)
  if (savedMode === 'expanded' || savedMode === 'collapsed' || savedMode === 'hover') {
    return savedMode
  }
  return 'hover'
}

function itemClass(active: boolean) {
  return cn(
    'inline-flex h-9 w-full items-center rounded-md px-2 transition-colors',
    active
      ? 'bg-[#232323] text-foreground'
      : 'text-muted-foreground hover:bg-[#202020] hover:text-foreground',
  )
}

function RailItemLabel({
  children,
  isExpanded,
}: {
  children: React.ReactNode
  isExpanded: boolean
}) {
  return (
    <span
      className={cn(
        'pointer-events-none absolute left-[calc(100%+0.5rem)] top-1/2 z-50 -translate-y-1/2 rounded-md border border-border bg-[#1f1f1f] px-2.5 py-1 text-xs font-medium text-foreground shadow-xl transition-all duration-150',
        isExpanded ? 'hidden' : 'invisible translate-x-1 opacity-0 group-hover:visible group-hover:translate-x-0 group-hover:opacity-100',
      )}
    >
      {children}
    </span>
  )
}

export function LeftRail({
  isAdmin,
}: {
  isAdmin?: boolean
}) {
  const pathname = usePathname()
  const router = useRouter()
  const settingsRef = useRef<HTMLDivElement | null>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [showModeMenu, setShowModeMenu] = useState(false)
  const railMode = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {}
      const handleStorage = (event: Event) => {
        if (!(event instanceof StorageEvent) || event.key === RAIL_MODE_KEY) {
          onStoreChange()
        }
      }
      window.addEventListener('storage', handleStorage)
      window.addEventListener('left-rail-mode-change', handleStorage)
      return () => {
        window.removeEventListener('storage', handleStorage)
        window.removeEventListener('left-rail-mode-change', handleStorage)
      }
    },
    readStoredRailMode,
    () => 'hover',
  )

  const isDashboard = pathname.startsWith('/dashboard') || pathname === '/'
  const isCalendar = pathname.startsWith('/calendar')
  const isInbox = pathname.startsWith('/inbox')
  const isUsers = pathname.startsWith('/users')
  const isProjects =
    pathname.startsWith('/projects') ||
    pathname.startsWith('/project/') ||
    pathname.startsWith('/issue/')

  const isExpanded = railMode === 'expanded' || (railMode === 'hover' && isHovering)
  const railWidthClass = railMode === 'expanded' ? 'w-52' : 'w-14'

  useEffect(() => {
    if (typeof window === 'undefined') return
    document.documentElement.style.setProperty(
      '--left-rail-offset',
      railMode === 'expanded' ? '13rem' : '3.5rem',
    )
  }, [railMode])

  useEffect(() => {
    router.prefetch('/dashboard')
    router.prefetch('/calendar')
    router.prefetch('/inbox')
    router.prefetch('/projects')
    if (isAdmin) {
      router.prefetch('/users')
    }
  }, [isAdmin, router])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) {
        setShowModeMenu(false)
      }
    }

    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [])

  const selectMode = (mode: RailMode) => {
    window.localStorage.setItem(RAIL_MODE_KEY, mode)
    window.dispatchEvent(new Event('left-rail-mode-change'))
    setShowModeMenu(false)
    if (mode !== 'hover') {
      setIsHovering(false)
    }
  }

  const labelClass =
    'overflow-hidden whitespace-nowrap text-sm transition-all duration-150'
  const textClass = cn(
    labelClass,
    isExpanded ? 'ml-2 w-auto opacity-100' : 'w-0 opacity-0',
  )
  const iconSlotClass = cn(
    'flex items-center justify-center transition-all duration-150',
    isExpanded ? 'w-auto' : 'w-full',
  )
  const showCollapsedTooltip = railMode === 'collapsed'

  return (
    <aside
      className={cn(
        'fixed bottom-0 left-0 top-14 z-40 overflow-visible transition-[width] duration-200',
        railWidthClass,
      )}
      onMouseEnter={() => {
        if (railMode === 'hover') setIsHovering(true)
      }}
      onMouseLeave={() => {
        if (railMode === 'hover') setIsHovering(false)
      }}
    >
      <div
        className={cn(
          'relative flex h-full flex-col items-stretch border-r border-[#30363d] bg-[#010409] px-2 transition-[width,box-shadow] duration-200',
          'border-r border-border bg-[#181818]',
          isExpanded
            ? 'w-52 shadow-[10px_0_30px_rgba(0,0,0,0.22)]'
            : 'w-14',
        )}
      >
        <nav className="flex w-full flex-1 flex-col gap-1.5 pt-2">
          <Link href="/dashboard" className={cn('group relative', itemClass(isDashboard))} title="Dashboard">
            <span className={iconSlotClass}>
              <House className="h-4 w-4" />
            </span>
            <span className={textClass}>
              Dashboard
            </span>
            {showCollapsedTooltip ? <RailItemLabel isExpanded={isExpanded}>Dashboard</RailItemLabel> : null}
          </Link>

          <Link href="/calendar" className={cn('group relative', itemClass(isCalendar))} title="Calendar">
            <span className={iconSlotClass}>
              <CalendarDays className="h-4 w-4" />
            </span>
            <span className={textClass}>
              Calendar
            </span>
            {showCollapsedTooltip ? <RailItemLabel isExpanded={isExpanded}>Calendar</RailItemLabel> : null}
          </Link>

          <Link href="/inbox" className={cn('group relative', itemClass(isInbox))} title="Inbox">
            <span className={iconSlotClass}>
              <Inbox className="h-4 w-4" />
            </span>
            <span className={textClass}>
              Inbox
            </span>
            {showCollapsedTooltip ? <RailItemLabel isExpanded={isExpanded}>Inbox</RailItemLabel> : null}
          </Link>

          <Link href="/projects" className={cn('group relative', itemClass(isProjects))} title="Project">
            <span className={iconSlotClass}>
              <FolderKanban className="h-4 w-4" />
            </span>
            <span className={textClass}>
              Project
            </span>
            {showCollapsedTooltip ? <RailItemLabel isExpanded={isExpanded}>Project</RailItemLabel> : null}
          </Link>
          {isAdmin && (
            <Link href="/users" className={cn('group relative', itemClass(isUsers))} title="Users">
              <span className={iconSlotClass}>
                <Users className="h-4 w-4" />
              </span>
              <span className={textClass}>
                Users
              </span>
              {showCollapsedTooltip ? <RailItemLabel isExpanded={isExpanded}>Users</RailItemLabel> : null}
            </Link>
          )}
        </nav>

        <div className="mb-3 flex flex-col gap-1.5">
          <div ref={settingsRef} className="relative">
            <button
              type="button"
              className={cn('group relative', itemClass(showModeMenu))}
              title="Rail mode"
              aria-haspopup="menu"
              aria-expanded={showModeMenu}
              onClick={() => setShowModeMenu((current) => !current)}
            >
              <span className={iconSlotClass}>
                <PanelLeft className="h-4 w-4" />
              </span>
              <span className={textClass}>
                {railMode === 'expanded'
                  ? 'Expanded'
                  : railMode === 'collapsed'
                    ? 'Collapsed'
                    : 'Expand on hover'}
              </span>
              {showCollapsedTooltip ? <RailItemLabel isExpanded={isExpanded}>Rail mode</RailItemLabel> : null}
            </button>

            {showModeMenu && (
              <div
                className={cn(
                  'absolute bottom-11 left-0 min-w-[220px] rounded-lg border border-border bg-[#1f1f1f] p-2 shadow-2xl',
                  isExpanded ? 'right-0' : 'left-12',
                )}
              >
                <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Rail mode
                </p>
                <div className="space-y-1">
                  {([
                    ['expanded', 'Expanded'],
                    ['collapsed', 'Collapsed'],
                    ['hover', 'Expand on hover'],
                  ] as const).map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => selectMode(mode)}
                      className={cn(
                        'w-full rounded-md px-3 py-2 text-left transition-colors',
                        railMode === mode
                          ? 'bg-[#232323] text-foreground'
                          : 'text-muted-foreground hover:bg-[#202020] hover:text-foreground',
                      )}
                    >
                      <span className="block text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
