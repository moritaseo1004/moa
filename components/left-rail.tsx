'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  CirclePlus,
  FolderKanban,
  Grid3X3,
  House,
  LogOut,
  Search,
  Settings,
} from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'

function itemClass(active: boolean) {
  return cn(
    'inline-flex h-9 w-full items-center justify-center rounded-lg px-2 transition-colors group-hover:justify-start',
    active
      ? 'bg-muted text-foreground'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  )
}

export function LeftRail({ isAuthenticated }: { isAuthenticated: boolean }) {
  const pathname = usePathname()
  const [activeProjectContext, setActiveProjectContext] = useState<{
    pathname: string
    id: string | null
    name: string | null
  }>({ pathname: '', id: null, name: null })
  const [projectShortcuts, setProjectShortcuts] = useState<
    Array<{ id: string; name: string; prefix?: string | null }>
  >([])

  const isDashboard = pathname === '/'
  const isProjects =
    pathname.startsWith('/projects') ||
    pathname.startsWith('/project/') ||
    pathname.startsWith('/issue/')
  const isSearch = pathname.startsWith('/search')

  useEffect(() => {
    if (!isAuthenticated) return
    const ctrl = new AbortController()
    const load = async () => {
      try {
        const res = await fetch(`/api/nav/context?pathname=${encodeURIComponent(pathname)}`, {
          signal: ctrl.signal,
        })
        if (!res.ok) {
          setActiveProjectContext({ pathname, id: null, name: null })
          return
        }
        const json = (await res.json()) as {
          activeProject?: { id?: string; name?: string } | null
          projectShortcuts?: Array<{ id: string; name: string; prefix?: string | null }>
        }
        setActiveProjectContext({
          pathname,
          id: json.activeProject?.id ?? null,
          name: json.activeProject?.name ?? null,
        })
        setProjectShortcuts(json.projectShortcuts ?? [])
      } catch (error) {
        if (
          !(error instanceof DOMException && error.name === 'AbortError') &&
          !(typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError')
        ) {
          console.error('[LeftRail] nav context fetch failed', error)
        }
      }
    }
    void load()

    return () => ctrl.abort()
  }, [pathname, isAuthenticated])

  const activeProjectName =
    activeProjectContext.pathname === pathname ? activeProjectContext.name : null
  const activeProjectId =
    activeProjectContext.pathname === pathname ? activeProjectContext.id : null

  const projectsLabel = useMemo(() => {
    if (!isProjects || !activeProjectName) return 'Projects'
    return `Projects · ${activeProjectName}`
  }, [isProjects, activeProjectName])

  return (
    <aside className="group fixed inset-y-0 left-0 z-40 w-14 overflow-hidden border-r border-[#30363d] bg-[#010409] pt-2 transition-[width] duration-200 hover:w-52">
      <div className="flex h-full flex-col items-stretch px-2">
        <Link
          href="/projects"
          className="mb-3 inline-flex h-9 w-full items-center justify-center rounded-lg border border-border bg-background px-2 transition-colors hover:bg-muted group-hover:justify-start"
          title="MoA"
        >
          <Image
            src="/brand/logo-mark.svg"
            alt="MoA"
            width={20}
            height={20}
            className="h-5 w-5"
            priority
          />
          <span className="ml-2 w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-150 group-hover:w-auto group-hover:opacity-100">
            MoA
          </span>
        </Link>

        <nav className="flex w-full flex-1 flex-col gap-1.5">
          <Link href="/projects" className={itemClass(isDashboard)} title="Dashboard">
            <House className="h-4 w-4" />
            <span className="ml-2 w-0 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-all duration-150 group-hover:w-auto group-hover:opacity-100">
              Dashboard
            </span>
          </Link>

          <Link href="/projects" className={itemClass(isProjects)} title="Projects">
            <FolderKanban className="h-4 w-4" />
            <span className="ml-2 w-0 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-all duration-150 group-hover:w-auto group-hover:opacity-100">
              {projectsLabel}
            </span>
          </Link>
          <div className="ml-6 -mt-0.5 hidden space-y-0.5 group-hover:block">
            {projectShortcuts.map((project) => {
              const active =
                pathname.startsWith(`/project/${project.id}`) ||
                activeProjectId === project.id
              return (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className={cn(
                    'block rounded-md px-2 py-1 text-xs transition-colors',
                    active
                      ? 'bg-muted text-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                  title={project.name}
                >
                  <span className="truncate block">
                    {project.prefix ? `${project.prefix} · ` : ''}
                    {project.name}
                  </span>
                </Link>
              )
            })}
          </div>

          <Link href="/search" className={itemClass(isSearch)} title="Search">
            <Search className="h-4 w-4" />
            <span className="ml-2 w-0 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-all duration-150 group-hover:w-auto group-hover:opacity-100">
              Search
            </span>
          </Link>

          <button type="button" className={itemClass(false)} title="Create issue (Ctrl+N)">
            <CirclePlus className="h-4 w-4" />
            <span className="ml-2 w-0 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-all duration-150 group-hover:w-auto group-hover:opacity-100">
              New issue
            </span>
          </button>

          <button type="button" className={itemClass(false)} title="Apps">
            <Grid3X3 className="h-4 w-4" />
            <span className="ml-2 w-0 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-all duration-150 group-hover:w-auto group-hover:opacity-100">
              Apps
            </span>
          </button>
        </nav>

        <div className="mb-3 flex flex-col gap-1.5">
          <button type="button" className={itemClass(false)} title="Settings">
            <Settings className="h-4 w-4" />
            <span className="ml-2 w-0 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-all duration-150 group-hover:w-auto group-hover:opacity-100">
              Settings
            </span>
          </button>

          {isAuthenticated && (
            <form action={signOut}>
              <button type="submit" className={itemClass(false)} title="Sign out">
                <LogOut className="h-4 w-4" />
                <span className="ml-2 w-0 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-all duration-150 group-hover:w-auto group-hover:opacity-100">
                  Sign out
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </aside>
  )
}
