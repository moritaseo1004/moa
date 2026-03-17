export const MENTION_MARKUP_PATTERN = /@\[(.+?)\]\((.+?)\)/g

export interface MentionToken {
  label: string
  userId: string
}

export function extractMentionQuery(text: string, cursor: number) {
  const uptoCursor = text.slice(0, cursor)
  const match = uptoCursor.match(/(?:^|\s)@([^\s@[\]()]{0,40})$/)
  if (!match || typeof match.index !== 'number') return null

  const fullMatch = match[0]
  const query = match[1] ?? ''
  const start = match.index + fullMatch.lastIndexOf('@')

  return {
    query,
    start,
    end: cursor,
  }
}

export function buildMentionMarkup(label: string, userId: string) {
  return `@[${label}](${userId})`
}

export function decodeMentionMarkup(text: string) {
  return text.replace(MENTION_MARKUP_PATTERN, (_match, label: string) => `@${label}`)
}

export function extractMentionTokens(text: string): MentionToken[] {
  return Array.from(text.matchAll(MENTION_MARKUP_PATTERN)).map((match) => ({
    label: match[1],
    userId: match[2],
  }))
}

export function encodeMentionMarkup(text: string, mentions: MentionToken[]) {
  let encoded = text

  for (const mention of mentions) {
    const escapedLabel = mention.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(`(^|\\s)@${escapedLabel}(?=$|\\s|[.,!?;:])`, 'g')
    encoded = encoded.replace(pattern, (match, prefix: string) => `${prefix}${buildMentionMarkup(mention.label, mention.userId)}`)
  }

  return encoded
}

export function syncMentionTokens(text: string, mentions: MentionToken[]) {
  return mentions.filter((mention) => {
    const escapedLabel = mention.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(`(^|\\s)@${escapedLabel}(?=$|\\s|[.,!?;:])`)
    return pattern.test(text)
  })
}
