'use client'

import Link from 'next/link'
import { MessageSquare, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/status'
import { PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/priority'
import type { IssueWithRelations } from '@/lib/types'

function DueDateCell({ dueDate }: { dueDate: string }) {
  const today = new Date().toISOString().slice(0, 10)
  const overdue = dueDate < today
  const isToday = dueDate === today
  return (
    <span className={cn(
      'text-xs',
      overdue ? 'text-red-500' : isToday ? 'text-amber-500' : 'text-muted-foreground',
    )}>
      {overdue ? '⚠ ' : ''}{dueDate}
    </span>
  )
}

export function TableView({ issues }: { issues: IssueWithRelations[] }) {
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
                  href={`/issue/${issue.id}`}
                  className="font-medium hover:underline line-clamp-1"
                >
                  {issue.title}
                </Link>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', STATUS_COLORS[issue.status])}>
                  {STATUS_LABELS[issue.status]}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-medium', PRIORITY_COLORS[issue.priority])}>
                  {PRIORITY_LABELS[issue.priority]}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                {issue.assignee?.name ?? '—'}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {issue.due_date ? <DueDateCell dueDate={issue.due_date} /> : <span className="text-xs text-muted-foreground">—</span>}
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
