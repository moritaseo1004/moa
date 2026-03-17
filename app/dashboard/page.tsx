import { Suspense } from 'react'
import { getAuthenticatedUserId } from '@/lib/actions/authz'
import { DashboardIssuesSection } from './_components/dashboard-issues-section'
import { DashboardNotesSection } from './_components/dashboard-notes-section'
import { DashboardSummary } from './_components/dashboard-summary'
import {
  DashboardIssuesSkeleton,
  DashboardNotesSkeleton,
  DashboardSummarySkeleton,
} from './_components/dashboard-section-skeletons'

export const metadata = { title: 'Dashboard — Tracker' }

export default async function DashboardPage() {
  const userId = await getAuthenticatedUserId()
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  return (
    <div className="mx-auto max-w-[1760px] px-4 py-8 space-y-8">
      <Suspense fallback={<DashboardSummarySkeleton />}>
        <DashboardSummary userId={userId} />
      </Suspense>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <Suspense fallback={<DashboardIssuesSkeleton />}>
          <DashboardIssuesSection userId={userId} today={today} />
        </Suspense>
        <Suspense fallback={<DashboardNotesSkeleton />}>
          <DashboardNotesSection userId={userId} today={today} />
        </Suspense>
      </div>
    </div>
  )
}
