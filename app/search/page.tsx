import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getCurrentUserProfile } from '@/lib/user-admin'
import { SearchFiltersSection } from './_components/search-filters-section'
import { SearchResults } from './_components/search-results'
import { SearchFiltersSkeleton } from './_components/search-filters-skeleton'
import { SearchResultsSkeleton } from './_components/search-results-skeleton'
import type { IssueStatus } from '@/lib/types'

export const metadata = { title: 'Search — Tracker' }

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    project?: string
    status?: IssueStatus
    assignee?: string
  }>
}) {
  const params = await searchParams
  const q = (params.q ?? '').trim()
  const project = params.project?.trim() || undefined
  const status = params.status || undefined
  const assignee = params.assignee?.trim() || undefined

  const user = await getCurrentUserProfile()
  if (!user) redirect('/login')

  return (
    <div className="mx-auto max-w-5xl px-6 py-6 space-y-5">
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <h1 className="text-lg font-semibold tracking-tight">Global Search</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {q ? (
            <>
              Results for <span className="text-foreground">&quot;{q}&quot;</span>
            </>
          ) : (
            <>
              Showing latest issues
            </>
          )}
        </p>
      </div>

      <Suspense fallback={<SearchFiltersSkeleton />}>
        <SearchFiltersSection
          userId={user.id}
          current={{ project, status, assignee }}
        />
      </Suspense>

      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults
          userId={user.id}
          q={q}
          project={project}
          status={status}
          assignee={assignee}
        />
      </Suspense>
    </div>
  )
}
