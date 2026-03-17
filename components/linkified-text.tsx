import Link from 'next/link'

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
        const parts = line.split(URL_PATTERN)

        return (
          <span key={`${line}-${lineIndex}`}>
            {parts.map((part, partIndex) => {
              if (!part) return null
              if (!part.match(URL_PATTERN)) {
                return <span key={`${part}-${partIndex}`}>{part}</span>
              }

              const { core, trailing } = splitTrailingPunctuation(part)
              if (!core) {
                return <span key={`${part}-${partIndex}`}>{part}</span>
              }

              return (
                <span key={`${part}-${partIndex}`}>
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
            })}
            {lineIndex < lines.length - 1 ? <br /> : null}
          </span>
        )
      })}
    </div>
  )
}
