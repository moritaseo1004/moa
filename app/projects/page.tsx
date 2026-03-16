import { getProjects } from '@/lib/data/projects'
import { isInboxProject } from '@/lib/project-utils'
import { CreateProjectForm } from './_components/create-project-form'
import { ProjectList } from './_components/project-list'

export const metadata = { title: 'Projects — Tracker' }

export default async function ProjectsPage() {
  const projects = await getProjects()
  const visibleProjects = projects.filter((project) => !isInboxProject(project))

  return (
    <div className="mx-auto max-w-[1760px] px-4 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Project</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {visibleProjects.length} project{visibleProjects.length !== 1 ? 's' : ''} in your workspace
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium">Project list</h2>
          </div>
          <div className="divide-y divide-border">
            <ProjectList projects={visibleProjects} />
          </div>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-2">
          <h2 className="text-sm font-medium">New project</h2>
          <CreateProjectForm />
        </div>
      </div>
    </div>
  )
}
