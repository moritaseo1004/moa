import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { GlobalCreateIssueModal } from '@/components/global-create-issue-modal'
import { GlobalSearchForm } from '@/components/global-search-form'
import { LeftRail } from '@/components/left-rail'
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
  const userLabel = user?.user_metadata?.name ?? user?.email ?? 'Workspace'

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
        {/* Top bar */}
        <header className="fixed left-14 right-0 top-0 z-30 h-14 border-b border-[#30363d] bg-[#010409]/95 backdrop-blur">
          <div className="flex h-full items-center justify-between px-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold tracking-tight">{userLabel}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">moa</span>
              <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] text-amber-300">
                PRODUCTION
              </span>
            </div>

            <div className="flex items-center gap-2">
              {user && <div className="w-[340px]"><GlobalSearchForm /></div>}
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <LeftRail isAuthenticated={Boolean(user)} />

        {/* Main content */}
        <main className="ml-14 min-h-screen pt-14">
          {children}
        </main>
        <GlobalCreateIssueModal />
      </body>
    </html>
  )
}
