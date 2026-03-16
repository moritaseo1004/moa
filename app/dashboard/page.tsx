import { getProjects } from '@/lib/data/projects'
import { getDueIssuesForDashboard } from '@/lib/data/issues'
import { getDashboardNotesByUser } from '@/lib/data/notes'
import { getAuthenticatedUserId } from '@/lib/actions/authz'
import { isInboxProject } from '@/lib/project-utils'
import { DashboardView } from '@/app/projects/_components/dashboard-view'

export const metadata = { title: 'Dashboard — Tracker' }

export default async function DashboardPage() {
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
  const visibleProjects = projects.filter((project) => !isInboxProject(project))

  return (
    <div className="mx-auto max-w-[1760px] px-4 py-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {visibleProjects.length} project{visibleProjects.length !== 1 ? 's' : ''} · {dueIssues.length} open issue
          {dueIssues.length !== 1 ? 's' : ''} with due date
        </p>
      </div>

      <DashboardView issues={dueIssues} today={today} initialNotes={notes} />
    </div>
  )
}
