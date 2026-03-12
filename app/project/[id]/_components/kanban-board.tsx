'use client'

import { useState, useEffect, useTransition } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { updateIssueStatus } from '@/lib/actions/issues'
import { ALL_STATUSES } from '@/lib/status'
import { PRIORITY_ORDER } from '@/lib/priority'
import { KanbanColumn } from './kanban-column'
import { IssueCardContent } from './issue-card'
import type { IssueWithRelations, IssueStatus, User } from '@/lib/types'

export function KanbanBoard({
  issues: initial,
  projectId,
  users,
}: {
  issues: IssueWithRelations[]
  projectId: string
  users: User[]
}) {
  const [issues, setIssues] = useState(initial)

  // Sync when server revalidates and parent re-renders with new data
  useEffect(() => {
    setIssues(initial)
  }, [initial])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const activeIssue = activeId ? issues.find((i) => i.id === activeId) ?? null : null

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string)
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    if (!over) return

    const issueId = active.id as string
    const newStatus = over.id as IssueStatus
    const issue = issues.find((i) => i.id === issueId)
    if (!issue || issue.status === newStatus) return

    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i)),
    )

    startTransition(() => {
      updateIssueStatus(issueId, newStatus, projectId)
    })
  }

  const filtered = issues.filter((i) => {
    if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false
    if (assigneeFilter && i.assignee_id !== assigneeFilter) return false
    return true
  })

  // Sort within each column by priority then created_at
  const sorted = [...filtered].sort((a, b) => {
    const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    if (pd !== 0) return pd
    return a.created_at < b.created_at ? -1 : 1
  })

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search issues…"
          className="h-8 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground w-48"
        />
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="h-8 rounded-lg border border-border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring/50 text-muted-foreground"
        >
          <option value="">All assignees</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        {(search || assigneeFilter) && (
          <button
            onClick={() => { setSearch(''); setAssigneeFilter('') }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3">
          {ALL_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              issues={sorted.filter((i) => i.status === status)}
            />
          ))}
        </div>

        {/* Floating drag preview */}
        <DragOverlay dropAnimation={null}>
          {activeIssue && (
            <div className="w-[210px] rotate-1 opacity-95">
              <IssueCardContent issue={activeIssue} shadow />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
