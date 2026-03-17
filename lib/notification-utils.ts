import { extractMentionTokens } from '@/lib/mentions'

export function getMentionedUserIds(text: string | null | undefined) {
  if (!text) return []

  return Array.from(
    new Set(
      extractMentionTokens(text)
        .map((mention) => mention.userId)
        .filter(Boolean),
    ),
  )
}

export function getNewMentionedUserIds(nextText: string | null | undefined, previousText: string | null | undefined) {
  const nextIds = new Set(getMentionedUserIds(nextText))
  const previousIds = new Set(getMentionedUserIds(previousText))

  return Array.from(nextIds).filter((id) => !previousIds.has(id))
}
