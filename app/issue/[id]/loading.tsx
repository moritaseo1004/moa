import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8 min-w-0">
          <div className="space-y-3">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-28 rounded-xl" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-24 rounded-xl" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-lg border border-border bg-card/50 p-5 space-y-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 rounded-lg" />
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-card/50 p-5 space-y-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
