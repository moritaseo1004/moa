import { getDueIssuesForDashboard } from '@/lib/data/issues'
import { DashboardIssuePanels } from '@/app/projects/_components/dashboard-view'

export async function DashboardIssuesSection({
  userId,
  today,
}: {
  userId: string | null
  today: string
}) {
  const dueIssues = userId ? await getDueIssuesForDashboard(userId) : []
  return <DashboardIssuePanels issues={dueIssues} today={today} />
}
