import type { IssueStatus } from '@/lib/types'

export const STATUS_LABELS: Record<IssueStatus, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  doing: 'In Progress',
  review: 'Review',
  done: 'Done',
}

export const STATUS_COLORS: Record<IssueStatus, string> = {
  backlog: 'border border-zinc-500/20 bg-zinc-500/10 text-zinc-300',
  todo: 'border border-sky-500/20 bg-sky-500/10 text-sky-300',
  doing: 'border border-amber-500/20 bg-amber-500/10 text-amber-300',
  review: 'border border-violet-500/20 bg-violet-500/10 text-violet-300',
  done: 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
}

export const STATUS_HEADER_BOX: Record<IssueStatus, string> = {
  backlog: 'border-zinc-500/18 bg-[#202020] text-zinc-200',
  todo: 'border-sky-500/18 bg-[#202020] text-sky-200',
  doing: 'border-amber-500/18 bg-[#202020] text-amber-200',
  review: 'border-violet-500/18 bg-[#202020] text-violet-200',
  done: 'border-emerald-500/18 bg-[#202020] text-emerald-200',
}

export const STATUS_COLUMN_SURFACE: Record<IssueStatus, string> = {
  backlog: 'border-zinc-500/12 bg-[#1c1c1c]',
  todo: 'border-sky-500/12 bg-[#1c1c1c]',
  doing: 'border-amber-500/12 bg-[#1c1c1c]',
  review: 'border-violet-500/12 bg-[#1c1c1c]',
  done: 'border-emerald-500/12 bg-[#1c1c1c]',
}

export const STATUS_CARD_TINT: Record<IssueStatus, string> = {
  backlog: 'border-zinc-500/14 bg-[#1f1f1f]',
  todo: 'border-sky-500/14 bg-[#1f1f1f]',
  doing: 'border-amber-500/14 bg-[#1f1f1f]',
  review: 'border-violet-500/14 bg-[#1f1f1f]',
  done: 'border-emerald-500/14 bg-[#1f1f1f]',
}

export const ALL_STATUSES: IssueStatus[] = ['backlog', 'todo', 'doing', 'review', 'done']
