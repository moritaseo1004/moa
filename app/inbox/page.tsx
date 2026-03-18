import Link from 'next/link'
import { getInboxProject } from '@/lib/data/projects'
import { getProjects } from '@/lib/data/projects'
import { getIssuesByProject } from '@/lib/data/issues'
import { getAssignableUsers } from '@/lib/data/users'
import { InboxTriageTable } from './_components/inbox-triage-table'

export const metadata = { title: 'Inbox — Tracker' }

export default async function InboxPage() {
  const project = await getInboxProject()

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

  const [issues, users, projects] = await Promise.all([
    getIssuesByProject(project.id),
    getAssignableUsers(),
    getProjects(),
  ])

  const assignableProjects = projects.filter((item) => item.id !== project.id)

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
          Triage incoming issues here, then move them into a project with the right assignee.
        </p>
      </div>

      <div className="flex-1 px-6 py-6">
        <InboxTriageTable
          issues={issues}
          inboxProjectId={project.id}
          projects={assignableProjects}
          users={users}
        />
      </div>
    </div>
  )
}
