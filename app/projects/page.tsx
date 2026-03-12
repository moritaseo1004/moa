import { getProjects } from '@/lib/data/projects'
import { getDueIssuesForDashboard } from '@/lib/data/issues'
import { getDashboardNotesByUser } from '@/lib/data/notes'
import { getAuthenticatedUserId } from '@/lib/actions/authz'
import { CreateProjectForm } from './_components/create-project-form'
import { ProjectList } from './_components/project-list'
import { DashboardView } from './_components/dashboard-view'

export const metadata = { title: 'Projects — Tracker' }

export default async function ProjectsPage() {
  const userId = await getAuthenticatedUserId()
  const [projects, dueIssues, notes] = await Promise.all([
    getProjects(),
    userId ? getDueIssuesForDashboard(userId) : Promise.resolve([]),
    userId ? getDashboardNotesByUser(userId) : Promise.resolve([]),
  ])
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  return (
    <div className="mx-auto max-w-[1760px] px-4 py-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {projects.length} project{projects.length !== 1 ? 's' : ''} · {dueIssues.length} open issue{dueIssues.length !== 1 ? 's' : ''} with due date
        </p>
      </div>

      <DashboardView issues={dueIssues} today={today} initialNotes={notes} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium">Project list</h2>
          </div>
          <div className="divide-y divide-border">
            <ProjectList projects={projects} />
          </div>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h2 className="text-sm font-medium">New project</h2>
          <CreateProjectForm />
        </div>
      </div>
    </div>
  )
}
