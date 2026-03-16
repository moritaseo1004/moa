'use client'

import { useCallback, useEffect, useState, startTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

function useIssueDetailSheetClose(closeHref: string) {
  const router = useRouter()
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    router.prefetch(closeHref)
  }, [closeHref, router])

  const handleClose = useCallback(() => {
    setIsClosing(true)
    startTransition(() => {
      router.replace(closeHref, { scroll: false })
    })
  }, [closeHref, router])

  return { isClosing, handleClose }
}

export function IssueDetailSheetFrame({
  closeHref,
  children,
}: {
  closeHref: string
  children: React.ReactNode
}) {
  const { isClosing, handleClose } = useIssueDetailSheetClose(closeHref)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleClose])

  return (
    <>
      <button
        type="button"
        onClick={handleClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px] transition-opacity duration-150',
          isClosing && 'pointer-events-none opacity-0',
        )}
        aria-label="Close issue panel"
      />

      <aside
        className={cn(
          'fixed bottom-0 right-0 top-14 z-50 w-full max-w-[900px] border-l border-border bg-[#181818] shadow-2xl transition-transform duration-150',
          isClosing && 'translate-x-full',
        )}
      >
        {children}
      </aside>
    </>
  )
}

export function IssueDetailSheetCloseButton({
  closeHref,
  className,
}: {
  closeHref: string
  className?: string
}) {
  const { handleClose } = useIssueDetailSheetClose(closeHref)

  return (
    <button
      type="button"
      onClick={handleClose}
      className={className}
      aria-label="Close issue panel"
    >
      ×
    </button>
  )
}
