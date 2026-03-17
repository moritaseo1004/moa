'use client'

import { useEffect, useState } from 'react'
import { Check, Link2 } from 'lucide-react'

export function CopyIssueLinkButton({
  issueId,
  size = 'sm',
}: {
  issueId: string
  size?: 'sm' | 'xs'
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return

    const timer = window.setTimeout(() => {
      setCopied(false)
    }, 1600)

    return () => window.clearTimeout(timer)
  }, [copied])

  async function handleCopy() {
    const url = `${window.location.origin}/issue/${issueId}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
  }

  const isSmall = size === 'xs'

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-2 rounded-md border border-border bg-[#1f1f1f] text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground ${
        isSmall ? 'h-8 px-2.5 text-xs' : 'h-9 px-3 text-sm'
      }`}
      aria-label="Copy issue link"
      title={copied ? 'Copied' : 'Copy issue link'}
    >
      {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Link2 className="h-4 w-4" />}
      <span>{copied ? 'Copied' : 'Copy link'}</span>
    </button>
  )
}
