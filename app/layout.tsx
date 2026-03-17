import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserProfile } from '@/lib/user-admin'
import { getProjects } from '@/lib/data/projects'
import { GlobalCreateIssueModal } from '@/components/global-create-issue-modal'
import { GlobalSearchForm } from '@/components/global-search-form'
import { HelpCenterButton } from '@/components/help-center-button'
import { HeaderProfileMenu } from '@/components/header-profile-menu'
import { LeftRail } from '@/components/left-rail'
import { ProjectSwitcher } from '@/components/project-switcher'
import { DEFAULT_WORKSPACE, formatRoleLabel } from '@/lib/workspace'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tracker',
  description: 'Internal project & issue tracking',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const profile = user ? await getCurrentUserProfile() : null
  const showShell = Boolean(user && profile?.is_approved)
  const projects = showShell ? await getProjects() : []
  const userLabel = profile?.name ?? user?.user_metadata?.name ?? user?.email ?? 'Workspace'
  const userEmail = profile?.email ?? user?.email ?? null
  const roleLabel = formatRoleLabel(profile?.role)

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
        {showShell ? (
          <>
            {/* Top bar */}
            <header
              className="fixed left-0 right-0 top-0 z-30 h-14 border-b border-border bg-[#181818]/95 backdrop-blur"
            >
              <div className="flex h-full items-center">
                <Link
                  href="/dashboard"
                  className="inline-flex h-full w-14 shrink-0 items-center justify-center border-r border-border bg-[#181818]"
                  title="MoA"
                >
                  <Image
                    src="/brand/logo-mark.svg"
                    alt="MoA"
                    width={22}
                    height={22}
                    className="h-[22px] w-[22px] object-contain"
                    unoptimized
                  />
                </Link>

                <div className="flex min-w-0 flex-1 items-center justify-between px-4">
                  <div className="flex min-w-0 items-center gap-2 text-sm">
                    <span className="truncate font-semibold tracking-tight text-foreground">
                      {DEFAULT_WORKSPACE.name}
                    </span>
                    <span className="text-border">/</span>
                    <ProjectSwitcher projects={projects} />
                  </div>

                  <div className="mx-6 hidden max-w-xl flex-1 lg:block">
                    <GlobalSearchForm />
                  </div>

                  <div className="flex items-center gap-2">
                    <HelpCenterButton isAdmin={profile?.role === 'admin'} />

                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-[#1f1f1f] text-muted-foreground transition-colors hover:bg-[#232323] hover:text-foreground"
                      title="Notifications"
                    >
                      <Bell className="h-4 w-4" />
                    </button>

                    {user ? (
                      <HeaderProfileMenu
                        name={userLabel}
                        email={userEmail}
                        roleLabel={roleLabel}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </header>

            <LeftRail isAdmin={profile?.role === 'admin'} />

            <main
              className="min-h-screen pt-14"
              style={{ marginLeft: 'var(--left-rail-offset, 3.5rem)' }}
            >
              {children}
            </main>
            <GlobalCreateIssueModal />
          </>
        ) : (
          <main className="min-h-screen">
            {children}
          </main>
        )}
      </body>
    </html>
  )
}
