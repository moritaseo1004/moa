const MASTER_EMAILS = new Set(['gwseo@mwkorea.co.kr'])

export function isMasterEmail(email: string | null | undefined): boolean {
  return Boolean(email && MASTER_EMAILS.has(email.trim().toLowerCase()))
}
