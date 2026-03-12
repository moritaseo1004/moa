import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
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

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex h-11 max-w-5xl items-center gap-6 px-4">
            <Link href="/projects" className="text-sm font-semibold tracking-tight">
              Tracker
            </Link>
            <nav className="flex items-center gap-4 flex-1">
              <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Projects
              </Link>
            </nav>

            {user && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {user.user_metadata?.name ?? user.email}
                </span>
                <form action={signOut}>
                  <Button type="submit" variant="ghost" size="xs">
                    Sign out
                  </Button>
                </form>
              </div>
            )}
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
