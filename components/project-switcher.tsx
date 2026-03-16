'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, FolderKanban, Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isInboxProject } from '@/lib/project-utils'
import type { Project } from '@/lib/types'

type RouteLabel = {
  label: string
  href: string
  activeProjectId: string | null
}

export function ProjectSwitcher({
  projects,
}: {
  projects: Project[]
}) {
  const pathname = usePathname()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeProject, setActiveProject] = useState<{ id: string | null; name: string | null }>({
    id: null,
    name: null,
  })

  useEffect(() => {
    const ctrl = new AbortController()

    async function loadContext() {
      try {
        const res = await fetch(`/api/nav/context?pathname=${encodeURIComponent(pathname)}`, {
          signal: ctrl.signal,
        })
        if (!res.ok) return
        const json = (await res.json()) as {
          activeProject?: { id?: string; name?: string } | null
        }
        setActiveProject({
          id: json.activeProject?.id ?? null,
          name: json.activeProject?.name ?? null,
        })
      } catch (error) {
        if (
          !(error instanceof DOMException && error.name === 'AbortError') &&
          !(typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError')
        ) {
          console.error('[ProjectSwitcher] nav context fetch failed', error)
        }
      }
    }

    void loadContext()
    return () => ctrl.abort()
  }, [pathname])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }

    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [])

  const routeLabel = useMemo<RouteLabel>(() => {
    if (pathname.startsWith('/project/') || pathname.startsWith('/issue/')) {
      return {
        label: activeProject.name ?? 'Project',
        href: activeProject.id ? `/project/${activeProject.id}` : '/projects',
        activeProjectId: activeProject.id,
      }
    }

    if (pathname.startsWith('/inbox')) {
      const inboxProject = projects.find((project) => isInboxProject(project))
      return {
        label: 'Inbox',
        href: '/inbox',
        activeProjectId: inboxProject?.id ?? null,
      }
    }

    if (pathname.startsWith('/users')) {
      return { label: 'Admin', href: '/users', activeProjectId: null }
    }

    return { label: 'All projects', href: '/projects', activeProjectId: null }
  }, [activeProject.id, activeProject.name, pathname, projects])

  const visibleProjects = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    const sorted = [...projects].sort((a, b) => a.name.localeCompare(b.name))
    if (!keyword) return sorted
    return sorted.filter((project) => {
      const haystack = `${project.name} ${project.prefix}`.toLowerCase()
      return haystack.includes(keyword)
    })
  }, [projects, search])

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() =>
          setOpen((value) => {
            const next = !value
            if (!next) setSearch('')
            return next
          })
        }
        className={cn(
          'inline-flex h-8 min-w-0 max-w-[220px] items-center gap-2 rounded-md px-1.5 text-sm transition-colors',
          open ? 'bg-[#202020] text-foreground' : 'text-muted-foreground hover:bg-[#202020] hover:text-foreground',
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <FolderKanban className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
        <span className="truncate text-left">{routeLabel.label}</span>
        <span
          className={cn(
            'ml-auto inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border/80 bg-[#202020] text-muted-foreground transition-all',
            open && 'text-foreground',
          )}
        >
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
        </span>
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[320px] rounded-lg border border-border bg-[#1c1c1c] p-2 shadow-2xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find project..."
              className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
            />
          </div>

          <div className="mt-2 max-h-[280px] overflow-y-auto">
            <Link
              href="/projects"
              onClick={() => {
                setOpen(false)
                setSearch('')
              }}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                routeLabel.activeProjectId === null && routeLabel.href === '/projects'
                  ? 'bg-[#2a2a2a] text-foreground'
                  : 'text-muted-foreground hover:bg-[#232323] hover:text-foreground',
              )}
            >
              <span className="truncate">All projects</span>
              {routeLabel.activeProjectId === null && routeLabel.href === '/projects' ? (
                <Check className="ml-auto h-4 w-4 text-foreground" />
              ) : null}
            </Link>

            <div className="my-2 border-t border-border/80" />

            {visibleProjects.length > 0 ? (
              visibleProjects.map((project) => {
                const active = project.id === routeLabel.activeProjectId
                return (
                  <Link
                    key={project.id}
                    href={isInboxProject(project) ? '/inbox' : `/project/${project.id}`}
                    onClick={() => {
                      setOpen(false)
                      setSearch('')
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                      active
                        ? 'bg-[#2a2a2a] text-foreground'
                        : 'text-muted-foreground hover:bg-[#232323] hover:text-foreground',
                    )}
                  >
                    <span className="truncate">
                      {project.name}
                    </span>
                    {active ? <Check className="ml-auto h-4 w-4 text-foreground" /> : null}
                  </Link>
                )
              })
            ) : (
              <div className="px-3 py-5 text-sm text-muted-foreground">No matching projects</div>
            )}
          </div>

          <div className="mt-2 border-t border-border/80 pt-2">
            <Link
              href="/projects"
              onClick={() => {
                setOpen(false)
                setSearch('')
              }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              New project
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
