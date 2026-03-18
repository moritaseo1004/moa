'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { InlineSpinner } from '@/components/ui/inline-spinner'
import { deleteProject, updateProjectPrefix } from '@/lib/actions/projects'
import { isInboxProject } from '@/lib/project-utils'
import type { Project } from '@/lib/types'

function PrefixEditor({ project }: { project: Project }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(project.prefix)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updateProjectPrefix(project.id, value)
      if (result.error) {
        setError(result.error)
      } else {
        setEditing(false)
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') { setValue(project.prefix); setEditing(false) }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
          onKeyDown={handleKeyDown}
          className="w-20 h-6 rounded border border-border bg-background px-1.5 text-xs font-mono uppercase outline-none focus:ring-1 focus:ring-ring/50"
          placeholder="PREFIX"
        />
        <button
          onClick={handleSave}
          disabled={isPending}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
        >
          {isPending ? <InlineSpinner className="h-3.5 w-3.5" /> : null}
          {isPending ? '저장 중…' : '저장'}
        </button>
        <button
          onClick={() => { setValue(project.prefix); setEditing(false); setError(null) }}
          disabled={isPending}
          className="text-xs text-muted-foreground hover:underline disabled:opacity-50"
        >
          취소
        </button>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
      title="클릭하여 prefix 수정"
    >
      {project.prefix}
    </button>
  )
}

export function ProjectList({ projects }: { projects: Project[] }) {
  const visibleProjects = projects.filter((project) => !isInboxProject(project))
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleDelete(projectId: string) {
    setError(null)
    startTransition(async () => {
      const result = await deleteProject(projectId)
      if (result.error) {
        setError(result.error)
      }
      setConfirmId(null)
    })
  }

  if (visibleProjects.length === 0) {
    return (
      <p className="px-4 py-6 text-sm text-muted-foreground text-center">
        No projects yet. Create one below.
      </p>
    )
  }

  return (
    <>
      {error && (
        <p className="px-4 py-2 text-sm text-destructive">{error}</p>
      )}
      {visibleProjects.map((project) => (
        <div
          key={project.id}
          className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <PrefixEditor project={project} />
            <Link
              href={`/project/${project.id}`}
              className="flex flex-col gap-0.5 min-w-0"
            >
              <span className="text-sm font-medium">{project.name}</span>
              {project.description && (
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {project.description}
                </span>
              )}
            </Link>
          </div>

          <div className="ml-4 shrink-0">
            {confirmId === project.id ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">삭제할까요?</span>
                <button
                  onClick={() => handleDelete(project.id)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1 text-xs text-destructive hover:underline disabled:opacity-50"
                >
                  {isPending ? <InlineSpinner className="h-3.5 w-3.5" /> : null}
                  {isPending ? '삭제 중…' : '확인'}
                </button>
                <button
                  onClick={() => setConfirmId(null)}
                  disabled={isPending}
                  className="text-xs text-muted-foreground hover:underline disabled:opacity-50"
                >
                  취소
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmId(project.id)}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                삭제
              </button>
            )}
          </div>
        </div>
      ))}
    </>
  )
}
