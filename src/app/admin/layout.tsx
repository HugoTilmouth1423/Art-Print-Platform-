import { redirect } from 'next/navigation'
import { createClient } from '@/supabase/server'
import Link from 'next/link'
import { LogoutButton } from '@/components/logout-button'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/admin')
  }

  return (
    <div className="bg-muted/30 min-h-screen">
      {/* Admin header */}
      <header className="bg-background border-border sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="font-serif text-xl font-semibold">
                Admin Dashboard
              </Link>
              <nav className="hidden items-center gap-6 sm:flex">
                <Link
                  href="/admin"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Projects
                </Link>
                <Link
                  href="/admin/palettes"
                  className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                >
                  Palettes
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-muted-foreground hidden text-sm sm:block">
                {user.email}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
