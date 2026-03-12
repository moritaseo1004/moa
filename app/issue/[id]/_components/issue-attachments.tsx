import { formatBytes } from '@/lib/utils'
import type { IssueAttachment } from '@/lib/types'
import { AddAttachmentButton } from './add-attachment-button'

function ImageAttachment({ att }: { att: IssueAttachment }) {
  return (
    <div className="space-y-1">
      <a
        href={att.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-lg border border-border"
      >
        <img
          src={att.thumbnail_url ?? att.file_url}
          alt={att.file_name}
          className="h-32 w-full object-cover transition-opacity hover:opacity-80"
        />
      </a>
      <div className="flex items-center justify-between gap-2 px-0.5">
        <p className="truncate text-xs text-muted-foreground">{att.file_name}</p>
        <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(att.file_size)}</span>
      </div>
    </div>
  )
}

function VideoAttachment({ att }: { att: IssueAttachment }) {
  return (
    <div className="space-y-1.5 rounded-lg border border-border p-3">
      <video
        src={att.file_url}
        controls
        className="w-full max-h-48 rounded"
      />
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs text-muted-foreground">{att.file_name}</p>
        <a
          href={att.file_url}
          download={att.file_name}
          className="shrink-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Download
        </a>
      </div>
    </div>
  )
}

function FileAttachment({ att }: { att: IssueAttachment }) {
  return (
    <a
      href={att.file_url}
      download={att.file_name}
      className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 hover:bg-muted/50 transition-colors"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{att.file_name}</p>
        <p className="text-xs text-muted-foreground">{formatBytes(att.file_size)}</p>
      </div>
      <svg className="h-4 w-4 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    </a>
  )
}

export function IssueAttachments({
  attachments,
  issueId,
}: {
  attachments: IssueAttachment[]
  issueId: string
}) {
  const images = attachments.filter((a) => a.file_type === 'image')
  const videos = attachments.filter((a) => a.file_type === 'video')
  const files = attachments.filter((a) => a.file_type === 'file')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Attachments
          {attachments.length > 0 && (
            <span className="ml-1 normal-case font-normal">({attachments.length})</span>
          )}
        </h2>
        <AddAttachmentButton issueId={issueId} />
      </div>

      {attachments.length === 0 && (
        <p className="text-xs text-muted-foreground">No attachments yet.</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((att) => (
            <ImageAttachment key={att.id} att={att} />
          ))}
        </div>
      )}

      {videos.length > 0 && (
        <div className="space-y-2">
          {videos.map((att) => (
            <VideoAttachment key={att.id} att={att} />
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((att) => (
            <FileAttachment key={att.id} att={att} />
          ))}
        </div>
      )}
    </div>
  )
}
