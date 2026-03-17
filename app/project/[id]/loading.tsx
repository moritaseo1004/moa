import { Skeleton } from '@/components/ui/skeleton'

function ColumnSkeleton() {
  return (
    <div className="min-w-[280px] flex-1 rounded-2xl border border-border bg-card/40 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-8 rounded-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="border-b border-border px-6 py-4 space-y-3">
        <Skeleton className="h-4 w-20" />
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto px-6 py-6">
        <div className="flex min-w-max gap-4">
          <ColumnSkeleton />
          <ColumnSkeleton />
          <ColumnSkeleton />
          <ColumnSkeleton />
        </div>
      </div>
    </div>
  )
}
