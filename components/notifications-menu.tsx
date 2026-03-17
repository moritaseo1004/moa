'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { Bell } from 'lucide-react'
import { getNotificationsSnapshot, markNotificationsSeen } from '@/lib/actions/notifications'
import { cn } from '@/lib/utils'
import type { NotificationWithActor } from '@/lib/types'

function getRelativeTimeLabel(value: string) {
  const date = new Date(value).getTime()
  const diffMinutes = Math.max(1, Math.round((Date.now() - date) / 60000))

  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.round(diffHours / 24)
  return `${diffDays}d ago`
}

export function NotificationsMenu({
  notifications,
  initialUnreadCount,
}: {
  notifications: NotificationWithActor[]
  initialUnreadCount: number
}) {
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(notifications)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let cancelled = false

    startTransition(async () => {
      const snapshot = await getNotificationsSnapshot()
      if (!cancelled) {
        setItems(snapshot.notifications)
        setUnreadCount(snapshot.unreadCount)
      }
    })

    return () => {
      cancelled = true
    }
  }, [pathname])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [])

  useEffect(() => {
    if (!open || unreadCount === 0) return

    startTransition(async () => {
      const result = await markNotificationsSeen()
      if (!result?.error) {
        setUnreadCount(0)
      }
    })
  }, [open, unreadCount])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className={cn(
          'relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-[#1f1f1f] text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground',
          open && 'bg-[#232323] text-foreground',
        )}
        title="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-primary-foreground shadow-[0_0_0_2px_#181818]">
            N
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-40 w-[360px] overflow-hidden rounded-xl border border-border bg-[#1f1f1f] shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Notifications</p>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
            {isPending ? <span className="text-[11px] text-muted-foreground">Updating…</span> : null}
          </div>

          {items.length > 0 ? (
            <div className="dashboard-scroll max-h-[420px] overflow-y-auto py-1">
              {items.map((notification) => (
                <Link
                  key={notification.id}
                  href={notification.link_url}
                  className="block border-b border-border/60 px-4 py-3 transition-colors hover:bg-[#232323]"
                  onClick={() => setOpen(false)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{notification.title}</p>
                      {notification.body ? (
                        <p className="mt-1 text-xs text-muted-foreground">{notification.body}</p>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground/80">
                      {getRelativeTimeLabel(notification.created_at)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-4 py-6 text-sm text-muted-foreground">
              No notifications yet.
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
