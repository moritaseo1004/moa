import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSummarySkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </div>
  )
}

export function DashboardIssuesSkeleton() {
  return (
    <div className="grid items-start gap-4 xl:grid-cols-2">
      <Skeleton className="h-[24rem] rounded-xl" />
      <Skeleton className="h-[24rem] rounded-xl" />
    </div>
  )
}

export function DashboardNotesSkeleton() {
  return <Skeleton className="h-[24rem] rounded-xl" />
}
