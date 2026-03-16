export function isInboxProject(project: { name: string } | null | undefined): boolean {
  return (project?.name ?? '').trim().toLowerCase() === 'inbox'
}
