'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { PriorityLabel, StatusBadge } from '@/components/issue-meta-badges'
import { addDashboardNote, deleteDashboardNote } from '@/lib/actions/notes'
import type { DashboardNote, IssueWithRelations } from '@/lib/types'
import { formatScheduleLabel } from '@/lib/issue-schedule'

interface DashboardViewProps {
  issues: IssueWithRelations[]
  today: string
  initialNotes: DashboardNote[]
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
      <StatusBadge status={issue.status} />
      <PriorityLabel priority={issue.priority} />
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
              <p className="mt-2 text-[11px] text-muted-foreground/80">
                {formatScheduleLabel(issue.start_date, issue.due_date)}
              </p>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}

export function DashboardIssuePanels({
  issues,
  today,
}: Pick<DashboardViewProps, 'issues' | 'today'>) {
  const weekStart = useMemo(() => startOfWeekMonday(today), [today])
  const weekEnd = useMemo(() => toYmd(addDays(parseYmd(weekStart), 6)), [weekStart])
  const weekFriday = useMemo(() => toYmd(addDays(parseYmd(weekStart), 4)), [weekStart])

  const todayIssues = useMemo(
    () => issues.filter((issue) => issue.due_date === today),
    [issues, today],
  )

  const weekIssues = useMemo(
    () => issues.filter((issue) => (issue.due_date ?? '') >= weekStart && (issue.due_date ?? '') <= weekEnd),
    [issues, weekEnd, weekStart],
  )

  return (
    <div className="grid items-start gap-4 xl:grid-cols-2">
      <div>
        <IssueList
          title="Today"
          subtitle={`기한: ${formatDateLabel(today)}`}
          issues={todayIssues}
          createDueDate={today}
        />
      </div>

      <div>
        <IssueList
          title="This week"
          subtitle={`기한: ${formatDateLabel(weekStart)} ~ ${formatDateLabel(weekEnd)}`}
          issues={weekIssues}
          createDueDate={weekFriday}
        />
      </div>
    </div>
  )
}

export function DashboardNotesPanel({
  today,
  initialNotes,
}: Pick<DashboardViewProps, 'today' | 'initialNotes'>) {
  const [notes, setNotes] = useState(initialNotes)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteError, setNoteError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const selectedNotes = useMemo(
    () => notes.filter((note) => note.note_date === today),
    [notes, today],
  )

  return (
    <section className="rounded-xl border border-border bg-card/50 p-4 xl:sticky xl:top-20">
      <div className="rounded-lg border border-border bg-background/60 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">Quick Notes</p>
          <span className="text-xs text-muted-foreground">{formatDateLabel(today)}</span>
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
                  noteDate: today,
                  title,
                  content: noteContent,
                })
                if (result.error) {
                  setNoteError(result.error)
                  return
                }
                if (result.note) {
                  const createdNote = result.note
                  setNotes((prev) => [createdNote, ...prev])
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
                    {note.content ? (
                      <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">{note.content}</p>
                    ) : null}
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
  )
}

export function DashboardView({ issues, today, initialNotes }: DashboardViewProps) {
  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
      <DashboardIssuePanels issues={issues} today={today} />
      <DashboardNotesPanel today={today} initialNotes={initialNotes} />
    </div>
  )
}
