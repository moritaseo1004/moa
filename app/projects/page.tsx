import Link from 'next/link'
import { getProjects } from '@/lib/data/projects'
import { CreateProjectForm } from './_components/create-project-form'

export const metadata = { title: 'Projects — Tracker' }

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {projects.length} project{projects.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Project list */}
      <div className="divide-y divide-border rounded-lg border border-border">
        {projects.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">
            No projects yet. Create one below.
          </p>
        ) : (
          projects.map((project) => (
            <Link
              key={project.id}
              href={`/project/${project.id}`}
              className="flex flex-col gap-0.5 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium">{project.name}</span>
              {project.description && (
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {project.description}
                </span>
              )}
            </Link>
          ))
        )}
      </div>

      {/* Create form */}
      <div className="rounded-lg border border-border p-4 space-y-2">
        <h2 className="text-sm font-medium">New project</h2>
        <CreateProjectForm />
      </div>
    </div>
  )
}
