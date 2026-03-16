import type { IssuePriority } from '@/lib/types'

export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  urgent: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const PRIORITY_COLORS: Record<IssuePriority, string> = {
  urgent: 'border border-rose-500/20 bg-rose-500/10 text-rose-300',
  high: 'border border-amber-500/20 bg-amber-500/10 text-amber-300',
  medium: 'border border-sky-500/20 bg-sky-500/10 text-sky-300',
  low: 'border border-zinc-500/20 bg-zinc-500/10 text-zinc-300',
}

export const PRIORITY_ORDER: Record<IssuePriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export const ALL_PRIORITIES: IssuePriority[] = ['urgent', 'high', 'medium', 'low']
