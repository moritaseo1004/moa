import { getDashboardNotesByUser } from '@/lib/data/notes'
import { DashboardNotesPanel } from '@/app/projects/_components/dashboard-view'

export async function DashboardNotesSection({
  userId,
  today,
}: {
  userId: string | null
  today: string
}) {
  const notes = userId ? await getDashboardNotesByUser(userId) : []
  return <DashboardNotesPanel today={today} initialNotes={notes} />
}
