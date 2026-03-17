import Link from 'next/link'
import { MENTION_MARKUP_PATTERN } from '@/lib/mentions'

const URL_PATTERN = /(https?:\/\/[^\s]+)/g

function splitTrailingPunctuation(text: string) {
  const match = text.match(/[.,!?;:)\]]+$/)
  if (!match) return { core: text, trailing: '' }

  return {
    core: text.slice(0, -match[0].length),
    trailing: match[0],
  }
}

export function LinkifiedText({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  const lines = text.split('\n')

  return (
    <div className={className}>
      {lines.map((line, lineIndex) => {
        const mentionParts = line.split(MENTION_MARKUP_PATTERN)
        const parts: Array<{ type: 'text' | 'mention'; value: string; userId?: string }> = []

        for (let index = 0; index < mentionParts.length; index += 1) {
          const segment = mentionParts[index]
          if (!segment) continue

          if (index % 3 === 0) {
            parts.push({ type: 'text', value: segment })
            continue
          }

          const userId = mentionParts[index + 1]
          parts.push({ type: 'mention', value: segment, userId })
          index += 1
        }

        return (
          <span key={`${line}-${lineIndex}`}>
            {parts.map((part, partIndex) => {
              if (part.type === 'mention' && part.userId) {
                return (
                  <Link
                    key={`${part.userId}-${partIndex}`}
                    href={`/users/${part.userId}`}
                    className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary align-middle hover:bg-primary/15"
                  >
                    @{part.value}
                  </Link>
                )
              }

              const urlParts = part.value.split(URL_PATTERN)

              return urlParts.map((urlPart, urlIndex) => {
                if (!urlPart) return null
                if (!urlPart.match(URL_PATTERN)) {
                  return <span key={`${partIndex}-${urlIndex}-${urlPart}`}>{urlPart}</span>
                }

                const { core, trailing } = splitTrailingPunctuation(urlPart)
                if (!core) {
                  return <span key={`${partIndex}-${urlIndex}-${urlPart}`}>{urlPart}</span>
                }

                return (
                  <span key={`${partIndex}-${urlIndex}-${urlPart}`}>
                    <Link
                      href={core}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-primary underline underline-offset-4 hover:text-primary/80"
                    >
                      {core}
                    </Link>
                    {trailing}
                  </span>
                )
              })
            })}
            {lineIndex < lines.length - 1 ? <br /> : null}
          </span>
        )
      })}
    </div>
  )
}
