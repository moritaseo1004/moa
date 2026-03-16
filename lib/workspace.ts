export const DEFAULT_WORKSPACE = {
  name: 'Mobile Works Korea',
  slug: 'mobile-works-korea',
} as const

export function formatRoleLabel(role: 'admin' | 'member' | null | undefined) {
  if (role === 'admin') return 'Admin'
  if (role === 'member') return 'Member'
  return 'Guest'
}
