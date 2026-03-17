import { getSearchFilterOptions } from '@/lib/services/search'
import { SearchFilters } from './search-filters'
import type { IssueStatus } from '@/lib/types'

export async function SearchFiltersSection({
  userId,
  current,
}: {
  userId: string
  current: {
    project?: string
    status?: IssueStatus
    assignee?: string
  }
}) {
  const options = await getSearchFilterOptions(userId)

  return (
    <SearchFilters
      projects={options.projects}
      assignees={options.assignees}
      current={current}
    />
  )
}
