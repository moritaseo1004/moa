'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { listMentionableUsers } from '@/lib/actions/users'
import {
  decodeMentionMarkup,
  encodeMentionMarkup,
  extractMentionQuery,
  extractMentionTokens,
  syncMentionTokens,
  type MentionToken,
} from '@/lib/mentions'
import { cn } from '@/lib/utils'

interface MentionableUser {
  id: string
  name: string
  email: string
}

interface MentionTextareaProps {
  name: string
  defaultValue?: string
  placeholder?: string
  rows?: number
  required?: boolean
  autoFocus?: boolean
  className?: string
  hintClassName?: string
  onPaste?: React.ClipboardEventHandler<HTMLTextAreaElement>
}

export function MentionTextarea({
  name,
  defaultValue,
  placeholder,
  rows = 4,
  required,
  autoFocus,
  className,
  hintClassName,
  onPaste,
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [users, setUsers] = useState<MentionableUser[]>([])
  const initialValue = decodeMentionMarkup(defaultValue ?? '')
  const [value, setValue] = useState(initialValue)
  const [mentions, setMentions] = useState<MentionToken[]>(extractMentionTokens(defaultValue ?? ''))
  const [activeQuery, setActiveQuery] = useState<ReturnType<typeof extractMentionQuery>>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const encodedValue = encodeMentionMarkup(value, mentions)

  useEffect(() => {
    let cancelled = false

    listMentionableUsers()
      .then((data) => {
        if (!cancelled) {
          setUsers(data)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUsers([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const form = textareaRef.current?.form
    if (!form) return

    function handleReset() {
      setValue(initialValue)
      setMentions(extractMentionTokens(defaultValue ?? ''))
      setActiveQuery(null)
    }

    form.addEventListener('reset', handleReset)
    return () => form.removeEventListener('reset', handleReset)
  }, [defaultValue, initialValue])

  const filteredUsers = useMemo(() => {
    if (!activeQuery) return []

    const normalized = activeQuery.query.trim().toLowerCase()
    return users
      .filter((user) => {
        if (!normalized) return true
        return user.name.toLowerCase().includes(normalized) || user.email.toLowerCase().includes(normalized)
      })
      .sort((a, b) => {
        if (!normalized) return a.name.localeCompare(b.name)

        const aNameStarts = a.name.toLowerCase().startsWith(normalized)
        const bNameStarts = b.name.toLowerCase().startsWith(normalized)
        if (aNameStarts !== bNameStarts) return aNameStarts ? -1 : 1

        const aEmailStarts = a.email.toLowerCase().startsWith(normalized)
        const bEmailStarts = b.email.toLowerCase().startsWith(normalized)
        if (aEmailStarts !== bEmailStarts) return aEmailStarts ? -1 : 1

        return a.name.localeCompare(b.name)
      })
      .slice(0, 6)
  }, [activeQuery, users])

  function updateQuery(nextValue: string, cursor: number | null) {
    const nextQuery = cursor === null ? null : extractMentionQuery(nextValue, cursor)

    setValue(nextValue)
    setMentions((prev) => syncMentionTokens(nextValue, prev))
    if (nextQuery?.query !== activeQuery?.query) {
      setSelectedIndex(0)
    }
    setActiveQuery(nextQuery)
  }

  function insertMention(user: MentionableUser) {
    const textarea = textareaRef.current
    if (!textarea || !activeQuery) return

    const mentionLabel = `@${user.name} `
    const nextValue = `${value.slice(0, activeQuery.start)}${mentionLabel}${value.slice(activeQuery.end)}`
    const nextCursor = activeQuery.start + mentionLabel.length

    setValue(nextValue)
    setMentions((prev) => {
      if (prev.some((mention) => mention.userId === user.id && mention.label === user.name)) {
        return prev
      }
      return [...prev, { label: user.name, userId: user.id }]
    })
    setActiveQuery(null)

    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(nextCursor, nextCursor)
    })
  }

  function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    updateQuery(event.target.value, event.target.selectionStart)
  }

  function handleClick(event: React.MouseEvent<HTMLTextAreaElement>) {
    updateQuery(event.currentTarget.value, event.currentTarget.selectionStart)
  }

  function handleKeyUp(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === 'Escape') return
    updateQuery(event.currentTarget.value, event.currentTarget.selectionStart)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!filteredUsers.length || !activeQuery) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % filteredUsers.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length)
      return
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      insertMention(filteredUsers[selectedIndex] ?? filteredUsers[0])
      return
    }

    if (event.key === 'Tab') {
      event.preventDefault()
      insertMention(filteredUsers[selectedIndex] ?? filteredUsers[0])
      return
    }

    if (event.key === 'Escape') {
      setActiveQuery(null)
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <textarea
          ref={textareaRef}
          name={`${name}__display`}
          value={value}
          placeholder={placeholder}
          rows={rows}
          required={required}
          autoFocus={autoFocus}
          onChange={handleChange}
          onClick={handleClick}
          onKeyUp={handleKeyUp}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            window.setTimeout(() => setActiveQuery(null), 100)
          }}
          onPaste={onPaste}
          className={className}
        />
        <input type="hidden" name={name} value={encodedValue} />

        {activeQuery && filteredUsers.length > 0 ? (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border/80 bg-popover shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
            <ul className="dashboard-scroll max-h-60 overflow-y-auto py-1 pr-1">
              {filteredUsers.map((user, index) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => insertMention(user)}
                    className={cn(
                      'group flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-all',
                      index === selectedIndex
                        ? 'bg-primary/12 text-foreground shadow-[inset_3px_0_0_0_var(--color-primary)]'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full transition-colors',
                        index === selectedIndex ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/40',
                      )}
                    />
                    <span className={cn('truncate font-medium', index === selectedIndex ? 'text-foreground' : '')}>
                      {user.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <p className={cn('text-xs text-muted-foreground', hintClassName)}>
        Type `@` to mention a teammate. Press Enter or Tab to insert the selected user.
      </p>
    </div>
  )
}
