import { Skeleton } from '@/components/ui/skeleton'

export function IssueDetailSheetSkeleton() {
  return (
    <>
      <div className="fixed inset-0 top-14 z-40 bg-black/30 backdrop-blur-[1px]" aria-hidden="true" />

      <aside className="fixed bottom-0 right-0 top-14 z-50 w-full max-w-[900px] border-l border-border bg-[#181818] shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="min-w-0 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-56" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="dashboard-scroll min-h-0 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                <div className="flex items-center justify-end gap-2">
                  <Skeleton className="h-8 w-28 rounded-md" />
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
                <div className="space-y-3 rounded-xl border border-border bg-card/40 p-5">
                  <Skeleton className="h-7 w-2/3" />
                  <Skeleton className="h-20 w-full" />
                </div>
                <div className="space-y-3 rounded-xl border border-border bg-card/40 p-5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <div className="space-y-3 rounded-xl border border-border bg-card/40 p-5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-10 w-28 rounded-md" />
                </div>
              </div>
            </div>

            <div className="dashboard-scroll min-h-0 overflow-y-auto border-t border-border px-5 py-6 xl:border-l xl:border-t-0">
              <div className="space-y-5">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-3">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-10 w-full rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
