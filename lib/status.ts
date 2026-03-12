import type { IssueStatus } from '@/lib/types'

export const STATUS_LABELS: Record<IssueStatus, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  doing: 'Doing',
  review: 'Review',
  done: 'Done',
}

export const STATUS_COLORS: Record<IssueStatus, string> = {
  backlog: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  todo: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  doing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  done: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
}

export const ALL_STATUSES: IssueStatus[] = ['backlog', 'todo', 'doing', 'review', 'done']
