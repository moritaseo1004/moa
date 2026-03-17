'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
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
import { ArrowDownWideNarrow, ChevronRight, LayoutGrid, PanelRightOpen, Table2 } from 'lucide-react'
import { MultiSelectFilter } from '@/components/multi-select-filter'
import { updateIssueStatus } from '@/lib/actions/issues'
import { ALL_STATUSES, STATUS_LABELS } from '@/lib/status'
import { ALL_PRIORITIES, PRIORITY_LABELS, PRIORITY_ORDER } from '@/lib/priority'
import { KanbanColumn } from './kanban-column'
import { IssueCardContent } from './issue-card'
import { TableView } from './table-view'
import type { IssuePriority, IssueWithRelations, IssueStatus, User } from '@/lib/types'

type ViewMode = 'kanban' | 'table'
type SortMode = 'latest' | 'oldest' | 'due_soon'
export type IssueOpenMode = 'panel' | 'page'

const ISSUE_OPEN_MODE_KEY = 'tracker-issue-open-mode'
const ISSUE_VIEW_MODE_KEY = 'tracker-issue-view-mode'

const SORT_MODE_LABELS: Record<SortMode, string> = {
  latest: 'Latest',
  oldest: 'Oldest',
  due_soon: 'Due soon',
}

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
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([])
  const [priorityFilter, setPriorityFilter] = useState<IssuePriority[]>([])
  const [statusFilter, setStatusFilter] = useState<IssueStatus[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [sortMode, setSortMode] = useState<SortMode>('latest')
  const [openMode, setOpenMode] = useState<IssueOpenMode>('panel')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const sortMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const stored = window.localStorage.getItem(ISSUE_OPEN_MODE_KEY)
    if (stored === 'panel' || stored === 'page') {
      setOpenMode(stored)
    }
    const storedViewMode = window.localStorage.getItem(ISSUE_VIEW_MODE_KEY)
    if (storedViewMode === 'kanban' || storedViewMode === 'table') {
      setViewMode(storedViewMode)
    }
  }, [])

  function handleOpenModeChange(nextMode: IssueOpenMode) {
    setOpenMode(nextMode)
    window.localStorage.setItem(ISSUE_OPEN_MODE_KEY, nextMode)
  }

  function handleViewModeChange(nextMode: ViewMode) {
    setViewMode(nextMode)
    window.localStorage.setItem(ISSUE_VIEW_MODE_KEY, nextMode)
  }

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!sortMenuRef.current?.contains(event.target as Node)) {
        setShowSortMenu(false)
      }
    }

    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [])

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
    if (assigneeFilter.length > 0 && !assigneeFilter.includes(i.assignee_id ?? 'unassigned')) {
      return false
    }
    if (priorityFilter.length > 0 && !priorityFilter.includes(i.priority)) {
      return false
    }
    if (viewMode === 'table' && statusFilter.length > 0 && !statusFilter.includes(i.status)) {
      return false
    }
    return true
  })

  // Global sort mode applied across all columns
  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === 'latest') {
      return a.created_at > b.created_at ? -1 : 1
    }

    if (sortMode === 'oldest') {
      return a.created_at < b.created_at ? -1 : 1
    }

    // due_soon: earliest due date first, then higher priority, then latest created
    const aDue = a.due_date ?? '9999-12-31'
    const bDue = b.due_date ?? '9999-12-31'
    if (aDue !== bDue) return aDue < bDue ? -1 : 1

    const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    if (pd !== 0) return pd

    return a.created_at > b.created_at ? -1 : 1
  })

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-[#1c1c1c] p-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search issues…"
          className="h-8 w-48 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground"
        />
        {viewMode === 'table' ? (
          <MultiSelectFilter
            label="Status"
            selectedValues={statusFilter}
            onApply={(values) => setStatusFilter(values as IssueStatus[])}
            options={ALL_STATUSES.map((status) => ({
              value: status,
              label: STATUS_LABELS[status],
            }))}
          />
        ) : null}
        <MultiSelectFilter
          label="Priority"
          selectedValues={priorityFilter}
          onApply={(values) => setPriorityFilter(values as IssuePriority[])}
          options={ALL_PRIORITIES.map((priority) => ({
            value: priority,
            label: PRIORITY_LABELS[priority],
          }))}
        />
        <MultiSelectFilter
          label="Assignee"
          selectedValues={assigneeFilter}
          onApply={setAssigneeFilter}
          options={[
            { value: 'unassigned', label: 'Unassigned' },
            ...users.map((u) => ({ value: u.id, label: u.name })),
          ]}
        />
        {(search || assigneeFilter.length > 0 || priorityFilter.length > 0 || statusFilter.length > 0) && (
          <button
            onClick={() => {
              setSearch('')
              setAssigneeFilter([])
              setPriorityFilter([])
              setStatusFilter([])
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear
          </button>
        )}
        <div ref={sortMenuRef} className="relative ml-auto">
          <button
            type="button"
            onClick={() => setShowSortMenu((value) => !value)}
            className="inline-flex h-8 items-center gap-2 rounded-md border border-border bg-[#202020] px-3 text-xs font-medium text-foreground transition-colors hover:bg-[#242424]"
          >
            <ArrowDownWideNarrow className="h-3.5 w-3.5 text-muted-foreground" />
            {SORT_MODE_LABELS[sortMode]}
          </button>

          {showSortMenu ? (
            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 min-w-[220px] rounded-lg border border-border bg-[#1c1c1c] p-1.5 shadow-2xl">
              {([
                ['latest', 'Sort by latest'],
                ['oldest', 'Sort by oldest'],
                ['due_soon', 'Sort by due soon'],
              ] as Array<[SortMode, string]>).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setSortMode(value)
                    setShowSortMenu(false)
                  }}
                  className={`
                    flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors
                    ${sortMode === value ? 'bg-[#2a2a2a] text-foreground' : 'text-muted-foreground hover:bg-[#232323] hover:text-foreground'}
                  `}
                >
                  <span>{label}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/80" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border bg-[#202020] p-0.5">
          <button
            onClick={() => handleOpenModeChange('panel')}
            className={`inline-flex items-center gap-1 rounded-sm px-2 py-1.5 text-xs transition-colors ${openMode === 'panel' ? 'bg-[#2a2a2a] text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            title="Open issues in side panel"
          >
            <PanelRightOpen className="h-3.5 w-3.5" />
            Panel
          </button>
          <button
            onClick={() => handleOpenModeChange('page')}
            className={`inline-flex items-center gap-1 rounded-sm px-2 py-1.5 text-xs transition-colors ${openMode === 'page' ? 'bg-[#2a2a2a] text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            title="Open issues as full pages"
          >
            <Table2 className="h-3.5 w-3.5" />
            Page
          </button>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border bg-[#202020] p-0.5">
          <button
            onClick={() => handleViewModeChange('kanban')}
            className={`rounded-sm p-1.5 transition-colors ${viewMode === 'kanban' ? 'bg-[#2a2a2a] text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            title="Kanban view"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleViewModeChange('table')}
            className={`rounded-sm p-1.5 transition-colors ${viewMode === 'table' ? 'bg-[#2a2a2a] text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            title="Table view"
          >
            <Table2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <TableView issues={sorted} openMode={openMode} />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid w-full min-w-[1120px] gap-3 [grid-template-columns:repeat(5,minmax(220px,1fr))] xl:min-w-0">
            {ALL_STATUSES.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                issues={sorted.filter((i) => i.status === status)}
                openMode={openMode}
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
      )}
    </div>
  )
}
