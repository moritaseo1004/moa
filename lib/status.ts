import type { IssueStatus } from '@/lib/types'

export const STATUS_LABELS: Record<IssueStatus, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  doing: 'In Progress',
  review: 'Review',
  done: 'Done',
}

export const STATUS_COLORS: Record<IssueStatus, string> = {
  backlog: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800/80 dark:text-zinc-400',
  todo: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  doing: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
  done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
}

export const STATUS_HEADER_BOX: Record<IssueStatus, string> = {
  backlog: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-200',
  todo: 'border-blue-500/30 bg-blue-500/10 text-blue-200',
  doing: 'border-orange-500/30 bg-orange-500/10 text-orange-200',
  review: 'border-purple-500/30 bg-purple-500/10 text-purple-200',
  done: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
}

export const STATUS_COLUMN_SURFACE: Record<IssueStatus, string> = {
  backlog: 'border-zinc-500/20 bg-zinc-500/[0.07]',
  todo: 'border-blue-500/20 bg-blue-500/[0.07]',
  doing: 'border-orange-500/20 bg-orange-500/[0.07]',
  review: 'border-purple-500/20 bg-purple-500/[0.07]',
  done: 'border-emerald-500/20 bg-emerald-500/[0.07]',
}

export const STATUS_CARD_TINT: Record<IssueStatus, string> = {
  backlog: 'border-zinc-500/30 bg-zinc-500/[0.14]',
  todo: 'border-blue-500/30 bg-blue-500/[0.14]',
  doing: 'border-orange-500/30 bg-orange-500/[0.14]',
  review: 'border-purple-500/30 bg-purple-500/[0.14]',
  done: 'border-emerald-500/30 bg-emerald-500/[0.14]',
}

export const ALL_STATUSES: IssueStatus[] = ['backlog', 'todo', 'doing', 'review', 'done']
