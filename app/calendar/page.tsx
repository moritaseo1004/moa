import { getAuthenticatedUserId } from '@/lib/actions/authz'
import { getDueIssuesForDashboard } from '@/lib/data/issues'
import { CalendarView } from './_components/calendar-view'

export const metadata = { title: 'Calendar — Tracker' }

export default async function CalendarPage() {
  const userId = await getAuthenticatedUserId()
  const issues = userId ? await getDueIssuesForDashboard(userId) : []
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  return (
    <div className="mx-auto max-w-[1760px] px-4 py-8 space-y-6">
      <div className="rounded-xl border border-border bg-card/40 p-5">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Calendar
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Team schedule overview</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            시작일과 마감일 기준으로 이슈 일정을 확인합니다. 회사 캘린더 연동은 다음 단계에서 이어집니다.
          </p>
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground">
          등록된 일정이 없습니다.
        </div>
      ) : (
        <CalendarView issues={issues} today={today} />
      )}
    </div>
  )
}
