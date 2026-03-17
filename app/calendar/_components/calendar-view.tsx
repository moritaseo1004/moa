'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Dot } from 'lucide-react'
import { PriorityLabel, StatusBadge } from '@/components/issue-meta-badges'
import type { IssueWithRelations } from '@/lib/types'
import { formatScheduleLabel } from '@/lib/issue-schedule'
import { cn } from '@/lib/utils'

function parseYmd(value: string): Date {
  return new Date(`${value}T00:00:00`)
}

function toYmd(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function formatDateLabel(value: string): string {
  return parseYmd(value).toLocaleDateString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  })
}

function IssueCard({ issue }: { issue: IssueWithRelations }) {
  return (
    <Link
      href={`/issue/${issue.id}`}
      className="block rounded-lg border border-border bg-background/60 px-3 py-3 transition-colors hover:border-primary/30 hover:bg-muted/50"
    >
      <p className="truncate text-sm font-medium">{issue.title}</p>
      <div className="mt-2 flex items-center gap-1.5">
        <StatusBadge status={issue.status} />
        <PriorityLabel priority={issue.priority} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {issue.project?.name ?? 'No project'} · {issue.assignee?.name ?? 'Unassigned'}
      </p>
      <p className="mt-2 text-[11px] text-muted-foreground/80">
        {formatScheduleLabel(issue.start_date, issue.due_date)}
      </p>
    </Link>
  )
}

export function CalendarView({
  issues,
  today,
}: {
  issues: IssueWithRelations[]
  today: string
}) {
  const [selectedDate, setSelectedDate] = useState(today)
  const [monthAnchor, setMonthAnchor] = useState(today.slice(0, 7))

  const issuesByDate = useMemo(() => {
    const startMap = new Map<string, IssueWithRelations[]>()
    const dueMap = new Map<string, IssueWithRelations[]>()
    for (const issue of issues) {
      if (issue.start_date) {
        const startList = startMap.get(issue.start_date) ?? []
        startList.push(issue)
        startMap.set(issue.start_date, startList)
      }
      if (issue.due_date) {
        const dueList = dueMap.get(issue.due_date) ?? []
        dueList.push(issue)
        dueMap.set(issue.due_date, dueList)
      }
    }
    return { startMap, dueMap }
  }, [issues])

  const selectedStartingIssues = issuesByDate.startMap.get(selectedDate) ?? []
  const selectedDueIssues = issuesByDate.dueMap.get(selectedDate) ?? []

  const { monthLabel, calendarDays } = useMemo(() => {
    const monthStart = parseYmd(`${monthAnchor}-01`)
    const offset = (monthStart.getDay() + 6) % 7
    const gridStart = addDays(monthStart, -offset)
    const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
    const label = monthStart.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
    return { monthLabel: label, calendarDays: days }
  }, [monthAnchor])

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(360px,0.9fr)]">
      <section className="rounded-xl border border-border bg-card/50 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.14)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Monthly overview
            </h2>
            <p className="text-xs text-muted-foreground">
              Select a date to review starting and due issues.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedDate(today)
                setMonthAnchor(today.slice(0, 7))
              }}
              className="inline-flex h-8 items-center rounded-md border border-border bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                const date = parseYmd(`${monthAnchor}-01`)
                date.setMonth(date.getMonth() - 1)
                setMonthAnchor(`${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`)
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background hover:bg-muted"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="min-w-36 text-center text-sm font-medium">{monthLabel}</p>
            <button
              type="button"
              onClick={() => {
                const date = parseYmd(`${monthAnchor}-01`)
                date.setMonth(date.getMonth() + 1)
                setMonthAnchor(`${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}`)
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background hover:bg-muted"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 text-muted-foreground">
            <Dot className="h-4 w-4 text-emerald-300" />
            Start
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 text-muted-foreground">
            <Dot className="h-4 w-4 text-amber-300" />
            Due
          </span>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-2 text-center text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {['월', '화', '수', '목', '금', '토', '일'].map((label, index) => (
            <span
              key={label}
              className={cn('py-1', index === 5 && 'text-blue-400', index === 6 && 'text-rose-400')}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date) => {
            const ymd = toYmd(date)
            const startCount = issuesByDate.startMap.get(ymd)?.length ?? 0
            const dueCount = issuesByDate.dueMap.get(ymd)?.length ?? 0
            const totalCount = startCount + dueCount
            const inCurrentMonth = ymd.startsWith(monthAnchor)
            const isSelected = ymd === selectedDate
            const isToday = ymd === today
            const day = date.getDay()

            return (
              <button
                key={ymd}
                type="button"
                onClick={() => setSelectedDate(ymd)}
                className={cn(
                  'min-h-[132px] rounded-xl border p-2.5 text-left transition-all',
                  inCurrentMonth
                    ? 'border-border bg-background/80'
                    : 'border-border/60 bg-background/[0.24] text-muted-foreground/70',
                  isSelected && 'border-primary/50 bg-primary/[0.08] shadow-[0_0_0_1px_rgba(62,207,142,0.12)]',
                  !isSelected && 'hover:border-border/90 hover:bg-background',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <p
                      className={cn(
                        'inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold',
                        isToday
                          ? 'bg-primary text-primary-foreground'
                          : [
                              day === 6 && 'text-blue-400',
                              day === 0 && 'text-rose-400',
                            ],
                      )}
                    >
                      {date.getDate()}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
                      {ymd.slice(5).replace('-', '.')}
                    </p>
                  </div>
                  <span className="h-6 w-6" aria-hidden="true" />
                </div>

                {totalCount > 0 ? (
                  <div className="mt-4 space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {startCount > 0 && (
                        <p className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-200">
                          Start {startCount}
                        </p>
                      )}
                      {dueCount > 0 && (
                        <p className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-200">
                          Due {dueCount}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      {[
                        ...(issuesByDate.startMap.get(ymd) ?? []).map((issue) => ({ issue })),
                        ...(issuesByDate.dueMap.get(ymd) ?? []).map((issue) => ({ issue })),
                      ].slice(0, 2).map(({ issue }) => (
                        <p key={issue.id} className="truncate rounded-md border border-border/60 bg-background/90 px-2 py-1.5 text-[10px] text-foreground/85">
                          {issue.title}
                        </p>
                      ))}
                      {totalCount > 2 && (
                        <p className="text-[10px] text-muted-foreground/80">
                          +{totalCount - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 min-h-[48px]" />
                )}

                {isSelected ? (
                  <div className="mt-3 h-1.5 rounded-full bg-primary/80" />
                ) : (
                  <div className="mt-3 h-1.5 rounded-full bg-transparent" />
                )}
              </button>
            )
          })}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card/50 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.14)] xl:sticky xl:top-20">
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-border/80 pb-4">
          <div>
            <h2 className="text-base font-semibold">{formatDateLabel(selectedDate)}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Starting and due issues scheduled on the selected date.
            </p>
          </div>
          <span className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
            {selectedStartingIssues.length + selectedDueIssues.length}건
          </span>
        </div>

        <div className="dashboard-scroll max-h-[min(70vh,760px)] space-y-3 overflow-y-auto pr-1">
          {selectedStartingIssues.length === 0 && selectedDueIssues.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
              선택한 날짜에 시작 또는 마감 일정이 없습니다.
            </div>
          ) : (
            <>
              {selectedStartingIssues.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-200">
                      Starting
                    </span>
                    <span className="text-xs text-muted-foreground">{selectedStartingIssues.length}건</span>
                  </div>
                  {selectedStartingIssues.map((issue) => <IssueCard key={`start-${issue.id}`} issue={issue} />)}
                </div>
              )}
              {selectedDueIssues.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-200">
                      Due
                    </span>
                    <span className="text-xs text-muted-foreground">{selectedDueIssues.length}건</span>
                  </div>
                  {selectedDueIssues.map((issue) => <IssueCard key={`due-${issue.id}`} issue={issue} />)}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
