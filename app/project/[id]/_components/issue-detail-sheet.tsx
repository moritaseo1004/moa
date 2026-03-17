import Link from 'next/link'
import { Suspense } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getIssue, getIssueSequence } from '@/lib/data/issues'
import { EditIssueForm } from '@/app/issue/[id]/_components/edit-issue-form'
import { CompleteButton } from '@/app/issue/[id]/_components/complete-button'
import { CopyIssueLinkButton } from '@/app/issue/[id]/_components/copy-issue-link-button'
import { IssueAttachmentsSection } from '@/app/issue/[id]/_components/issue-attachments-section'
import { IssueCommentsSection } from '@/app/issue/[id]/_components/issue-comments-section'
import { IssueDetailSidebar } from '@/app/issue/[id]/_components/issue-detail-sidebar'
import { IssueActivitySection } from '@/app/issue/[id]/_components/issue-activity-section'
import {
  IssueActivitySectionSkeleton,
  IssueAttachmentsSectionSkeleton,
  IssueCommentsSectionSkeleton,
  IssueDetailSidebarSkeleton,
} from '@/app/issue/[id]/_components/issue-detail-section-skeletons'
import { getCurrentUserProfile } from '@/lib/user-admin'
import { IssueDetailSheetCloseButton, IssueDetailSheetFrame } from './issue-detail-sheet-frame'

export async function IssueDetailSheet({
  issueId,
  projectId,
  basePath,
}: {
  issueId: string
  projectId: string
  basePath?: string
}) {
  const currentUser = await getCurrentUserProfile()

  const [issue, sequence] = await Promise.all([
    getIssue(issueId),
    getIssueSequence(projectId),
  ])

  if (!issue) return null

  const panelBasePath = basePath ?? `/project/${projectId}`
  const closeHref = panelBasePath
  const currentIndex = sequence.findIndex((item) => item.id === issue.id)
  const previousIssue = currentIndex > 0 ? sequence[currentIndex - 1] : null
  const nextIssue = currentIndex >= 0 && currentIndex < sequence.length - 1 ? sequence[currentIndex + 1] : null
  const previousHref = previousIssue ? `${panelBasePath}?issue=${previousIssue.id}` : null
  const nextHref = nextIssue ? `${panelBasePath}?issue=${nextIssue.id}` : null

  return (
    <IssueDetailSheetFrame closeHref={closeHref}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {issue.project?.prefix}-{issue.issue_number}
              </p>
              <h2 className="truncate text-sm font-semibold">{issue.title}</h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="mr-1 flex items-center gap-1">
                {previousHref ? (
                  <Link
                    href={previousHref}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-[#1f1f1f] text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground"
                    aria-label={`Open previous issue: ${previousIssue?.title ?? ''}`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-[#1b1b1b] text-muted-foreground/35">
                    <ChevronLeft className="h-4 w-4" />
                  </span>
                )}
                {nextHref ? (
                  <Link
                    href={nextHref}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-[#1f1f1f] text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground"
                    aria-label={`Open next issue: ${nextIssue?.title ?? ''}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-[#1b1b1b] text-muted-foreground/35">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </div>
              <Link
                href={`/issue/${issue.id}?returnTo=${encodeURIComponent(panelBasePath)}`}
                className="inline-flex h-8 items-center rounded-md border border-border bg-[#1f1f1f] px-3 text-xs text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground"
              >
                Open full page
              </Link>
              <CopyIssueLinkButton issueId={issue.id} size="xs" />
              <IssueDetailSheetCloseButton
                closeHref={closeHref}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-[#1f1f1f] text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground"
              />
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="dashboard-scroll min-h-0 overflow-y-auto px-6 py-6">
              <div className="space-y-8">
                <div className="flex items-center justify-end gap-2">
                  <CompleteButton issueId={issue.id} projectId={issue.project_id} isDone={issue.status === 'done'} />
                </div>

                <EditIssueForm issue={issue} />
                <Suspense fallback={<IssueAttachmentsSectionSkeleton />}>
                  <IssueAttachmentsSection issueId={issue.id} />
                </Suspense>

                <Suspense fallback={<IssueCommentsSectionSkeleton />}>
                  <IssueCommentsSection issueId={issue.id} currentUserId={currentUser?.id ?? null} />
                </Suspense>
              </div>
            </div>

            <div className="dashboard-scroll min-h-0 overflow-y-auto border-t border-border px-5 py-6 xl:border-l xl:border-t-0">
              <div className="space-y-5">
                <Suspense fallback={<IssueDetailSidebarSkeleton />}>
                  <IssueDetailSidebar
                    issue={issue}
                    currentUserId={currentUser?.id ?? null}
                    returnHref={panelBasePath}
                  />
                </Suspense>

                <Suspense fallback={<IssueActivitySectionSkeleton />}>
                  <IssueActivitySection issueId={issue.id} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
    </IssueDetailSheetFrame>
  )
}
