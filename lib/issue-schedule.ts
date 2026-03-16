export function formatScheduleLabel(startDate: string | null, dueDate: string | null) {
  if (startDate && dueDate) return `${startDate} -> ${dueDate}`
  if (startDate) return `Start ${startDate}`
  if (dueDate) return `Due ${dueDate}`
  return 'No schedule'
}
