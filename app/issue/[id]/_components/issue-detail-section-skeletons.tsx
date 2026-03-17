import { Skeleton } from '@/components/ui/skeleton'

export function IssueAttachmentsSectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}

export function IssueCommentsSectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-8 w-28" />
      </div>
    </div>
  )
}

export function IssueDetailSidebarSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-5 space-y-5">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  )
}

export function IssueActivitySectionSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}
