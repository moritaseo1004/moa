'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, Sparkles } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/status'
import { cn } from '@/lib/utils'
import type { SearchResult } from '@/lib/types'

export function GlobalSearchForm() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const initialQuery = pathname === '/search' ? (searchParams.get('q') ?? '') : ''
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(initialQuery)
  const [preview, setPreview] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (!modalRef.current?.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [open])

  useEffect(() => {
    if (!open) return
    const ctrl = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search/preview?q=${encodeURIComponent(query)}`, {
          signal: ctrl.signal,
        })
        if (!res.ok) {
          setPreview([])
          return
        }
        const json = (await res.json()) as { results?: SearchResult[] }
        setPreview(json.results ?? [])
      } catch (error) {
        if (
          !(error instanceof DOMException && error.name === 'AbortError') &&
          !(typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError')
        ) {
          console.error('[GlobalSearchForm] preview fetch failed', error)
        }
      } finally {
        setLoading(false)
      }
    }, 180)

    return () => {
      ctrl.abort()
      clearTimeout(timer)
    }
  }, [query, open])

  useEffect(() => {
    if (preview.length === 0) {
      setActiveIndex(0)
      return
    }
    if (activeIndex >= preview.length) {
      setActiveIndex(0)
    }
  }, [preview, activeIndex])

  const resultLabel = useMemo(() => {
    if (loading) return 'Searching...'
    return `${preview.length} quick result${preview.length !== 1 ? 's' : ''}`
  }, [loading, preview.length])

  function goToSearch(e?: React.FormEvent) {
    if (e) e.preventDefault()
    const q = query.trim()
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
    setOpen(false)
  }

  function goToIssue(issueId: string) {
    router.push(`/issue/${issueId}`)
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex h-9 w-full max-w-xl items-center gap-2 rounded-md border border-border bg-[#1f1f1f] px-3.5 text-left shadow-sm transition-colors hover:bg-[#232323]"
      >
        <Search className="h-4 w-4 text-muted-foreground/80" />
        <span className="flex-1 truncate text-sm text-muted-foreground">
          Search issues across all projects...
        </span>
        <kbd className="rounded-sm border border-border bg-[#181818] px-2 py-0.5 text-[11px] text-muted-foreground">
          Ctrl + K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-[2px]">
          <div
            ref={modalRef}
            className="relative mx-auto mt-[10vh] w-[min(720px,92vw)] overflow-hidden rounded-lg border border-border bg-card shadow-2xl"
          >
            <form onSubmit={goToSearch} className="border-b border-border p-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/80" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      if (preview.length > 0) {
                        setActiveIndex((prev) => (prev + 1) % preview.length)
                      }
                      return
                    }
                    if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      if (preview.length > 0) {
                        setActiveIndex((prev) => (prev - 1 + preview.length) % preview.length)
                      }
                      return
                    }
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (preview.length > 0 && preview[activeIndex]) {
                        goToIssue(preview[activeIndex].issueId)
                        return
                      }
                      goToSearch()
                    }
                  }}
                  placeholder="Search issues across all projects..."
                  className="h-11 w-full rounded-md border border-border bg-background pl-9 pr-24 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Enter
                </button>
              </div>
            </form>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              <div className="mb-2 flex items-center justify-between px-2">
                <p className="text-xs text-muted-foreground">{resultLabel}</p>
                <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  Quick Preview
                </span>
              </div>

              <div className="space-y-1.5">
                {preview.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    No quick matches. Press Enter to see full results.
                  </div>
                ) : (
                  preview.map((item) => (
                    <Link
                      key={item.issueId}
                      href={`/issue/${item.issueId}`}
                      onMouseEnter={() => {
                        const idx = preview.findIndex((p) => p.issueId === item.issueId)
                        if (idx >= 0) setActiveIndex(idx)
                      }}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                        activeIndex === preview.findIndex((p) => p.issueId === item.issueId)
                          ? 'border-primary/40 bg-muted/50'
                          : 'border-border/70 bg-background/60 hover:bg-muted/40',
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.issueTitle}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.projectName}</p>
                      </div>
                      <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', STATUS_COLORS[item.status])}>
                        {STATUS_LABELS[item.status]}
                      </span>
                    </Link>
                  ))
                )}
              </div>

              <button
                type="button"
                onClick={() => goToSearch()}
                className="mt-2 flex w-full items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                View all results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
