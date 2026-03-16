'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { MessageSquare, Paperclip } from 'lucide-react'
import { PriorityLabel, StatusBadge } from '@/components/issue-meta-badges'
import { cn } from '@/lib/utils'
import type { IssueWithRelations } from '@/lib/types'
import type { IssueOpenMode } from './kanban-board'

function DateCell({ value, kind }: { value: string; kind: 'start' | 'due' }) {
  const today = new Date().toISOString().slice(0, 10)
  const overdue = kind === 'due' && value < today
  const isToday = value === today
  return (
    <span className={cn(
      'text-xs',
      overdue ? 'text-red-500' : isToday ? 'text-amber-500' : kind === 'start' ? 'text-emerald-400' : 'text-muted-foreground',
    )}>
      {overdue ? '⚠ ' : ''}{value}
    </span>
  )
}

export function TableView({
  issues,
  openMode,
}: {
  issues: IssueWithRelations[]
  openMode: IssueOpenMode
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (issues.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">No issues found.</p>
    )
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">ID</th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide w-full">Title</th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Status</th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Priority</th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Assignee</th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Start</th>
            <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">Due date</th>
            <th className="px-4 py-2.5 whitespace-nowrap">
              <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
            </th>
            <th className="px-4 py-2.5 whitespace-nowrap">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {issues.map((issue) => (
            <tr key={issue.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="text-xs font-mono text-muted-foreground">
                  {issue.project?.prefix}-{issue.issue_number}
                </span>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`${(() => {
                    const next = new URLSearchParams(searchParams.toString())
                    next.set('issue', issue.id)
                    const panelHref = `${pathname}?${next.toString()}`
                    const pageHref = `/issue/${issue.id}`
                    return openMode === 'page' ? pageHref : panelHref
                  })()}`}
                  className="font-medium hover:underline line-clamp-1"
                >
                  {issue.title}
                </Link>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <StatusBadge status={issue.status} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <PriorityLabel priority={issue.priority} />
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                {issue.assignee?.name ?? '—'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {issue.start_date ? <DateCell value={issue.start_date} kind="start" /> : <span className="text-xs text-muted-foreground">—</span>}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {issue.due_date ? <DateCell value={issue.due_date} kind="due" /> : <span className="text-xs text-muted-foreground">—</span>}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground tabular-nums">
                {(issue.issue_attachments?.length ?? 0) > 0 ? issue.issue_attachments!.length : '—'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground tabular-nums">
                {(issue.comments?.length ?? 0) > 0 ? issue.comments!.length : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
