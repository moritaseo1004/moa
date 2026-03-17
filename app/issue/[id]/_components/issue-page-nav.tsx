'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'

export function IssuePageNav({
  projectHref,
  previousIssue,
  nextIssue,
  returnTo,
}: {
  projectHref: string
  previousIssue: { id: string; label: string } | null
  nextIssue: { id: string; label: string } | null
  returnTo?: string
}) {
  const router = useRouter()

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-[#1f1f1f] px-3 text-sm text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="flex items-center gap-2">
        {previousIssue ? (
          <Link
            href={`/issue/${previousIssue.id}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-[#1f1f1f] px-3 text-sm text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground"
            title={previousIssue.label}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>
        ) : null}

        {nextIssue ? (
          <Link
            href={`/issue/${nextIssue.id}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-[#1f1f1f] px-3 text-sm text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground"
            title={nextIssue.label}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : null}

        {!previousIssue && !nextIssue ? (
          <Link
            href={returnTo ?? projectHref}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-[#1f1f1f] px-3 text-sm text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground"
          >
            Back to project
          </Link>
        ) : null}
      </div>
    </div>
  )
}
