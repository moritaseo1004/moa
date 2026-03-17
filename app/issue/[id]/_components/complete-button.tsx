'use client'

import { useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCheck } from 'lucide-react'
import { updateIssueStatus } from '@/lib/actions/issues'
import { Button } from '@/components/ui/button'
import { InlineSpinner } from '@/components/ui/inline-spinner'
import { cn } from '@/lib/utils'

export function CompleteButton({
  issueId,
  projectId,
  isDone,
  showShortcut = true,
}: {
  issueId: string
  projectId: string
  isDone: boolean
  showShortcut?: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function complete() {
    if (isDone || isPending) return
    startTransition(async () => {
      await updateIssueStatus(issueId, 'done', projectId)
      router.refresh()
    })
  }

  // Keyboard shortcut: Ctrl/Cmd + Enter
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Enter') return
      if (!(e.metaKey || e.ctrlKey) || e.altKey) return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return
      complete()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [issueId, projectId, isDone]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Button
      onClick={complete}
      disabled={isDone || isPending}
      variant={isDone ? 'secondary' : 'default'}
      size="lg"
      className={cn('h-9', isDone && 'opacity-60')}
    >
      {isPending ? <InlineSpinner className="h-4 w-4" /> : <CheckCheck />}
      {isDone ? 'Done' : isPending ? 'Completing…' : 'Complete'}
      {!isDone && showShortcut && (
        <kbd className="ml-1 rounded border border-current/30 px-1 py-px text-[10px] font-mono opacity-60">
          Ctrl + Enter
        </kbd>
      )}
    </Button>
  )
}
