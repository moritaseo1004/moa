import Link from 'next/link'
import { Suspense } from 'react'
import { getInboxProject } from '@/lib/data/projects'
import { getIssuesByProject } from '@/lib/data/issues'
import { getUsers } from '@/lib/data/users'
import { KanbanBoard } from '@/app/project/[id]/_components/kanban-board'
import { IssueDetailSheet } from '@/app/project/[id]/_components/issue-detail-sheet'
import { IssueDetailSheetSkeleton } from '@/app/project/[id]/_components/issue-detail-sheet-skeleton'

export const metadata = { title: 'Inbox — Tracker' }

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ issue?: string }>
}) {
  const project = await getInboxProject()
  const { issue: selectedIssueId } = await searchParams

  if (!project) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <h1 className="text-lg font-semibold tracking-tight">Inbox</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Inbox project is not configured yet.
          </p>
        </div>
      </div>
    )
  }

  const [issues, users] = await Promise.all([
    getIssuesByProject(project.id),
    getUsers(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b border-border px-6 py-4">
        <div className="text-xs text-muted-foreground">
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <span className="mx-1">/</span>
          <span>Inbox</span>
        </div>
        <div className="mt-1 flex items-baseline gap-3">
          <h1 className="text-lg font-semibold tracking-tight">Inbox</h1>
          <span className="text-xs text-muted-foreground">
            {issues.length} issue{issues.length !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          External-channel issues land here first so you can set the project and assignee.
        </p>
      </div>

      <div className="flex-1 overflow-x-auto px-6 py-6">
        <KanbanBoard issues={issues} projectId={project.id} users={users} />
      </div>

      {selectedIssueId ? (
        <Suspense key={selectedIssueId} fallback={<IssueDetailSheetSkeleton />}>
          <IssueDetailSheet issueId={selectedIssueId} projectId={project.id} basePath="/inbox" />
        </Suspense>
      ) : null}
    </div>
  )
}
