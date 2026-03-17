import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getIssue, getIssueSequence } from '@/lib/data/issues'
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/status'
import { getCurrentUserProfile } from '@/lib/user-admin'
import { cn } from '@/lib/utils'
import { IssuePageNav } from './_components/issue-page-nav'
import { EditIssueForm } from './_components/edit-issue-form'
import { CompleteButton } from './_components/complete-button'
import { CopyIssueLinkButton } from './_components/copy-issue-link-button'
import { IssueAttachmentsSection } from './_components/issue-attachments-section'
import { IssueCommentsSection } from './_components/issue-comments-section'
import { IssueDetailSidebar } from './_components/issue-detail-sidebar'
import { IssueActivitySection } from './_components/issue-activity-section'
import {
  IssueActivitySectionSkeleton,
  IssueAttachmentsSectionSkeleton,
  IssueCommentsSectionSkeleton,
  IssueDetailSidebarSkeleton,
} from './_components/issue-detail-section-skeletons'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const issue = await getIssue(id)
  return { title: issue ? `${issue.title} — Tracker` : 'Issue' }
}

export default async function IssuePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ returnTo?: string }>
}) {
  const { id } = await params
  const { returnTo } = await searchParams
  const currentUser = await getCurrentUserProfile()
  const issue = await getIssue(id)
  if (!issue) notFound()
  return (
    <IssuePageContent id={id} issue={issue} currentUserId={currentUser?.id ?? null} returnTo={returnTo} />
  )
}

async function IssuePageContent({
  id,
  issue,
  currentUserId,
  returnTo,
}: {
  id: string
  issue: NonNullable<Awaited<ReturnType<typeof getIssue>>>
  currentUserId: string | null
  returnTo?: string
}) {
  const sequence = await getIssueSequence(issue.project_id)
  const currentIndex = sequence.findIndex((item) => item.id === issue.id)
  const previousIssue =
    currentIndex > 0
      ? {
          id: sequence[currentIndex - 1].id,
          label: `${issue.project?.prefix}-${sequence[currentIndex - 1].issue_number} ${sequence[currentIndex - 1].title}`,
        }
      : null
  const nextIssue =
    currentIndex >= 0 && currentIndex < sequence.length - 1
      ? {
          id: sequence[currentIndex + 1].id,
          label: `${issue.project?.prefix}-${sequence[currentIndex + 1].issue_number} ${sequence[currentIndex + 1].title}`,
        }
      : null

  const isDone = issue.status === 'done'

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <IssuePageNav
        projectHref={`/project/${issue.project_id}`}
        previousIssue={previousIssue}
        nextIssue={nextIssue}
        returnTo={returnTo}
      />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link href="/projects" className="hover:underline">Projects</Link>
          <span>/</span>
          {issue.project ? (
            <>
              <Link href={`/project/${issue.project_id}`} className="hover:underline">
                {issue.project.name}
              </Link>
              <span>/</span>
              <span className="font-mono font-medium text-foreground/70">
                {issue.project.prefix}-{issue.issue_number}
              </span>
              <span>/</span>
            </>
          ) : null}
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              STATUS_COLORS[issue.status],
            )}
          >
            {STATUS_LABELS[issue.status]}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CopyIssueLinkButton issueId={issue.id} />
          <CompleteButton
            issueId={issue.id}
            projectId={issue.project_id}
            isDone={isDone}
            showShortcut={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-8">
          <EditIssueForm issue={issue} />

          <Suspense fallback={<IssueAttachmentsSectionSkeleton />}>
            <IssueAttachmentsSection issueId={id} />
          </Suspense>

          <Suspense fallback={<IssueCommentsSectionSkeleton />}>
            <IssueCommentsSection issueId={issue.id} currentUserId={currentUserId} />
          </Suspense>
        </div>

        <div className="space-y-5 text-sm">
          <Suspense fallback={<IssueDetailSidebarSkeleton />}>
            <IssueDetailSidebar issue={issue} currentUserId={currentUserId} returnHref={returnTo} />
          </Suspense>

          <Suspense fallback={<IssueActivitySectionSkeleton />}>
            <IssueActivitySection issueId={issue.id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
