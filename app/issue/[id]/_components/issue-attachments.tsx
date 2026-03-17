import Image from 'next/image'
import { formatBytes } from '@/lib/utils'
import type { IssueAttachment } from '@/lib/types'
import { AddAttachmentButton } from './add-attachment-button'
import { AttachmentDropzone } from './attachment-dropzone'
import { DeleteAttachmentButton } from './delete-attachment-button'

function ImageAttachment({ att, issueId }: { att: IssueAttachment; issueId: string }) {
  return (
    <div className="space-y-1">
      <a
        href={att.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-lg border border-border"
      >
        <Image
          src={att.thumbnail_url ?? att.file_url}
          alt={att.file_name}
          width={512}
          height={256}
          unoptimized
          className="h-32 w-full object-cover transition-opacity hover:opacity-80"
        />
      </a>
      <div className="flex items-center justify-between gap-2 px-0.5">
        <p className="truncate text-xs text-muted-foreground">{att.file_name}</p>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground">{formatBytes(att.file_size)}</span>
          <DeleteAttachmentButton attachmentId={att.id} fileUrl={att.file_url} issueId={issueId} />
        </div>
      </div>
    </div>
  )
}

function VideoAttachment({ att, issueId }: { att: IssueAttachment; issueId: string }) {
  return (
    <div className="space-y-1.5 rounded-lg border border-border p-3">
      <video src={att.file_url} controls className="w-full max-h-48 rounded" />
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs text-muted-foreground">{att.file_name}</p>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={att.file_url}
            download={att.file_name}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Download
          </a>
          <DeleteAttachmentButton attachmentId={att.id} fileUrl={att.file_url} issueId={issueId} />
        </div>
      </div>
    </div>
  )
}

function FileAttachment({ att, issueId }: { att: IssueAttachment; issueId: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
      <a
        href={att.file_url}
        download={att.file_name}
        className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 transition-opacity"
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
      <DeleteAttachmentButton attachmentId={att.id} fileUrl={att.file_url} issueId={issueId} />
    </div>
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
          <span className="ml-2 normal-case font-normal text-xs opacity-60">최대 10MB</span>
        </h2>
        <AddAttachmentButton issueId={issueId} />
      </div>

      <AttachmentDropzone issueId={issueId} />

      {attachments.length === 0 && (
        <p className="text-xs text-muted-foreground">No attachments yet.</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((att) => (
            <ImageAttachment key={att.id} att={att} issueId={issueId} />
          ))}
        </div>
      )}

      {videos.length > 0 && (
        <div className="space-y-2">
          {videos.map((att) => (
            <VideoAttachment key={att.id} att={att} issueId={issueId} />
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((att) => (
            <FileAttachment key={att.id} att={att} issueId={issueId} />
          ))}
        </div>
      )}
    </div>
  )
}
