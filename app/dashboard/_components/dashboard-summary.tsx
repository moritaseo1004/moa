import { getProjects } from '@/lib/data/projects'
import { getDueIssuesForDashboard } from '@/lib/data/issues'
import { isInboxProject } from '@/lib/project-utils'

export async function DashboardSummary({ userId }: { userId: string | null }) {
  const [projects, dueIssues] = await Promise.all([
    getProjects(),
    userId ? getDueIssuesForDashboard(userId) : Promise.resolve([]),
  ])
  const visibleProjects = projects.filter((project) => !isInboxProject(project))

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {visibleProjects.length} project{visibleProjects.length !== 1 ? 's' : ''} · {dueIssues.length} open issue
        {dueIssues.length !== 1 ? 's' : ''} with due date
      </p>
    </div>
  )
}
