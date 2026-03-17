import { Skeleton } from '@/components/ui/skeleton'

export function SearchFiltersSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
      </div>
    </div>
  )
}
