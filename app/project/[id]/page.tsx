import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProject } from '@/lib/data/projects'
import { getIssuesByProject } from '@/lib/data/issues'
import { getUsers } from '@/lib/data/users'
import { KanbanBoard } from './_components/kanban-board'
import { CreateIssueModal } from './_components/create-issue-modal'
import { IssueDetailSheet } from './_components/issue-detail-sheet'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getProject(id)
  return { title: project ? `${project.name} — Tracker` : 'Project' }
}

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ issue?: string }>
}) {
  const { id } = await params
  const { issue: selectedIssueId } = await searchParams
  const [project, issues, users] = await Promise.all([getProject(id), getIssuesByProject(id), getUsers()])

  if (!project) notFound()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Project header */}
      <div className="border-b border-border px-6 py-4">
        <div className="text-xs text-muted-foreground mb-1">
          <Link href="/projects" className="hover:underline">Projects</Link>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h1 className="text-lg font-semibold tracking-tight">{project.name}</h1>
            <span className="text-xs text-muted-foreground">
              {issues.length} issue{issues.length !== 1 ? 's' : ''}
            </span>
          </div>
          <CreateIssueModal projectId={project.id} />
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
        )}
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto px-6 py-6">
        <KanbanBoard issues={issues} projectId={project.id} users={users} />
      </div>

      {selectedIssueId ? (
        <IssueDetailSheet issueId={selectedIssueId} projectId={project.id} />
      ) : null}
    </div>
  )
}
