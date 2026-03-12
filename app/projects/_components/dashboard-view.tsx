'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { addDashboardNote, deleteDashboardNote } from '@/lib/actions/notes'
import type { DashboardNote, IssueWithRelations } from '@/lib/types'
import { PRIORITY_LABELS } from '@/lib/priority'
import { STATUS_LABELS } from '@/lib/status'
import { cn } from '@/lib/utils'

interface DashboardViewProps {
  issues: IssueWithRelations[]
  today: string
  initialNotes: DashboardNote[]
}

const PRIORITY_BADGE: Record<IssueWithRelations['priority'], string> = {
  urgent: 'border-red-400/35 bg-red-500/20 text-red-100',
  high: 'border-orange-400/35 bg-orange-500/20 text-orange-100',
  medium: 'border-sky-400/35 bg-sky-500/20 text-sky-100',
  low: 'border-zinc-400/35 bg-zinc-500/20 text-zinc-100',
}

const STATUS_BADGE: Record<IssueWithRelations['status'], string> = {
  backlog: 'border-zinc-400/35 bg-zinc-500/20 text-zinc-100',
  todo: 'border-blue-400/35 bg-blue-500/20 text-blue-100',
  doing: 'border-amber-400/35 bg-amber-500/20 text-amber-100',
  review: 'border-violet-400/35 bg-violet-500/20 text-violet-100',
  done: 'border-emerald-400/35 bg-emerald-500/20 text-emerald-100',
}

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

function startOfWeekMonday(value: string): string {
  const date = parseYmd(value)
  const offset = (date.getDay() + 6) % 7
  return toYmd(addDays(date, -offset))
}

function openCreateIssueWithDueDate(dueDate: string) {
  window.dispatchEvent(new CustomEvent('moa:create-issue', { detail: { dueDate } }))
}

function formatDateLabel(value: string): string {
  const date = parseYmd(value)
  return date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short' })
}

function IssueLabels({ issue }: { issue: IssueWithRelations }) {
  return (
    <div className="mt-2 flex items-center gap-1.5">
      <span className={cn('rounded-full border px-1.5 py-0.5 text-[10px] font-semibold', PRIORITY_BADGE[issue.priority])}>
        {PRIORITY_LABELS[issue.priority]}
      </span>
      <span className={cn('rounded-full border px-1.5 py-0.5 text-[10px] font-semibold', STATUS_BADGE[issue.status])}>
        {STATUS_LABELS[issue.status]}
      </span>
    </div>
  )
}

function IssueList({
  title,
  subtitle,
  issues,
  createDueDate,
}: {
  title: string
  subtitle: string
  issues: IssueWithRelations[]
  createDueDate: string
}) {
  return (
    <section className="rounded-xl border border-border bg-card/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            {title}
            <span className="inline-flex rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {issues.length}건
            </span>
          </h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => openCreateIssueWithDueDate(createDueDate)}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs text-foreground transition-colors hover:bg-muted"
        >
          <Plus className="h-3.5 w-3.5" />
          새로 만들기
        </button>
      </div>

      <div className="dashboard-scroll max-h-80 space-y-3 overflow-y-auto pr-1">
        {issues.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
            등록된 이슈가 없습니다.
          </p>
        ) : (
          issues.map((issue) => (
            <Link
              key={issue.id}
              href={`/issue/${issue.id}`}
              className="block rounded-lg border border-border bg-background/60 px-3 py-3 transition-colors hover:bg-muted/50"
            >
              <p className="truncate text-sm font-medium">{issue.title}</p>
              <IssueLabels issue={issue} />
              <p className="mt-2 text-xs text-muted-foreground">
                {issue.project?.name ?? 'No project'} · {issue.assignee?.name ?? 'Unassigned'}
              </p>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}

export function DashboardView({ issues, today, initialNotes }: DashboardViewProps) {
  const weekStart = useMemo(() => startOfWeekMonday(today), [today])
  const weekEnd = useMemo(() => toYmd(addDays(parseYmd(weekStart), 6)), [weekStart])
  const weekFriday = useMemo(() => toYmd(addDays(parseYmd(weekStart), 4)), [weekStart])

  const [selectedDate, setSelectedDate] = useState(today)
  const [monthAnchor, setMonthAnchor] = useState(today.slice(0, 7))
  const [notes, setNotes] = useState(initialNotes)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteError, setNoteError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const issuesByDate = useMemo(() => {
    const map = new Map<string, IssueWithRelations[]>()
    for (const issue of issues) {
      if (!issue.due_date) continue
      const arr = map.get(issue.due_date) ?? []
      arr.push(issue)
      map.set(issue.due_date, arr)
    }
    return map
  }, [issues])

  const todayIssues = useMemo(
    () => issues.filter((issue) => issue.due_date === today),
    [issues, today],
  )

  const weekIssues = useMemo(
    () => issues.filter((issue) => (issue.due_date ?? '') >= weekStart && (issue.due_date ?? '') <= weekEnd),
    [issues, weekEnd, weekStart],
  )

  const selectedIssues = issuesByDate.get(selectedDate) ?? []
  const selectedNotes = useMemo(
    () => notes.filter((note) => note.note_date === selectedDate),
    [notes, selectedDate],
  )

  const { monthLabel, calendarDays } = useMemo(() => {
    const monthStart = parseYmd(`${monthAnchor}-01`)
    const offset = (monthStart.getDay() + 6) % 7
    const gridStart = addDays(monthStart, -offset)
    const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))
    const label = monthStart.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
    return { monthLabel: label, calendarDays: days }
  }, [monthAnchor])

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
      <div className="space-y-4">
        <IssueList
          title="오늘까지 할 일"
          subtitle={`기한: ${formatDateLabel(today)}`}
          issues={todayIssues}
          createDueDate={today}
        />
        <IssueList
          title="이번주에 할 일"
          subtitle={`기한: ${formatDateLabel(weekStart)} ~ ${formatDateLabel(weekEnd)}`}
          issues={weekIssues}
          createDueDate={weekFriday}
        />
      </div>

      <section className="rounded-xl border border-border bg-card/50 p-4 xl:sticky xl:top-20">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            월간 캘린더
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const d = parseYmd(`${monthAnchor}-01`)
                d.setMonth(d.getMonth() - 1)
                setMonthAnchor(`${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}`)
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
                const d = parseYmd(`${monthAnchor}-01`)
                d.setMonth(d.getMonth() + 1)
                setMonthAnchor(`${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}`)
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background hover:bg-muted"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[2.35fr_1fr]">
          <div>
            <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
              {['월', '화', '수', '목', '금', '토', '일'].map((label, idx) => (
                <span
                  key={label}
                  className={cn(
                    'py-1',
                    idx === 5 && 'text-blue-400',
                    idx === 6 && 'text-rose-400',
                  )}
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date) => {
                const ymd = toYmd(date)
                const inCurrentMonth = ymd.startsWith(monthAnchor)
                const isSelected = ymd === selectedDate
                const count = issuesByDate.get(ymd)?.length ?? 0
                const day = date.getDay()
                return (
                  <button
                    key={ymd}
                    type="button"
                    onClick={() => setSelectedDate(ymd)}
                    className={cn(
                      'min-h-20 rounded-lg border p-2 text-left transition-colors',
                      inCurrentMonth ? 'border-border bg-background/70' : 'border-border/60 bg-background/30 text-muted-foreground/70',
                      isSelected && 'border-primary/50 bg-primary/10',
                    )}
                  >
                    <p
                      className={cn(
                        'text-xs font-medium',
                        day === 6 && 'text-blue-400',
                        day === 0 && 'text-rose-400',
                      )}
                    >
                      {date.getDate()}
                    </p>
                    {count > 0 && (
                      <p className="mt-2 inline-flex rounded-full bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                        {count}건
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background/60 p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">{formatDateLabel(selectedDate)} 일정</p>
              <button
                type="button"
                onClick={() => openCreateIssueWithDueDate(selectedDate)}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-background px-2 text-xs hover:bg-muted"
              >
                <Plus className="h-3.5 w-3.5" />
                새로 만들기
              </button>
            </div>
            <div className="dashboard-scroll max-h-[min(56vh,640px)] space-y-3 overflow-y-auto pr-1">
              {selectedIssues.length === 0 ? (
                <p className="rounded-md border border-dashed border-border px-2 py-6 text-center text-sm text-muted-foreground">
                  해당 날짜 일정이 없습니다.
                </p>
              ) : (
                selectedIssues.map((issue) => (
                  <Link
                    key={issue.id}
                    href={`/issue/${issue.id}`}
                    className="block rounded-md border border-border bg-background px-3 py-3 text-sm hover:bg-muted/50"
                  >
                    <p className="truncate font-medium">{issue.title}</p>
                    <IssueLabels issue={issue} />
                    <p className="mt-2 text-xs text-muted-foreground">
                      {issue.project?.name ?? 'No project'} · {issue.assignee?.name ?? 'Unassigned'}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-border bg-background/60 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Quick Notes</p>
            <span className="text-xs text-muted-foreground">{formatDateLabel(selectedDate)}</span>
          </div>

          <div className="space-y-2">
            <input
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="메모 제목"
              className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="간단 메모..."
              rows={2}
              className="w-full resize-none rounded-md border border-border bg-background px-2.5 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                const title = noteTitle.trim()
                if (!title) {
                  setNoteError('메모 제목을 입력해 주세요.')
                  return
                }
                setNoteError(null)
                startTransition(async () => {
                  const result = await addDashboardNote({
                    noteDate: selectedDate,
                    title,
                    content: noteContent,
                  })
                  if (result.error) {
                    setNoteError(result.error)
                    return
                  }
                  if (result.note) {
                    setNotes((prev) => [result.note, ...prev])
                  }
                  setNoteTitle('')
                  setNoteContent('')
                })
              }}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              메모 추가
            </button>
            {noteError && <p className="text-xs text-destructive">{noteError}</p>}
          </div>

          <div className="dashboard-scroll mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
            {selectedNotes.length === 0 ? (
              <p className="rounded-md border border-dashed border-border px-2 py-5 text-center text-sm text-muted-foreground">
                선택한 날짜의 메모가 없습니다.
              </p>
            ) : (
              selectedNotes.map((note) => (
                <div key={note.id} className="rounded-md border border-border bg-background px-2.5 py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{note.title}</p>
                      {note.content && (
                        <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{note.content}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        startTransition(async () => {
                          const result = await deleteDashboardNote(note.id)
                          if (result.error) {
                            setNoteError(result.error)
                            return
                          }
                          setNoteError(null)
                          setNotes((prev) => prev.filter((n) => n.id !== note.id))
                        })
                      }}
                      className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
