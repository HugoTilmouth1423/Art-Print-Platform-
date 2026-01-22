'use client'

import Link from 'next/link'
import { ThemeSwitcher } from '@/components/theme-switcher'

interface HeaderProps {
  showNav?: boolean
}

export function Header({ showNav = true }: HeaderProps) {
  return (
    <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-foreground font-serif text-xl font-semibold tracking-tight">
            Custom Artwork
          </span>
        </Link>

        {showNav && (
          <nav className="hidden items-center gap-6 sm:flex">
            <Link
              href="/#how-it-works"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="/#gallery"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              Gallery
            </Link>
            <Link
              href="/create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors"
            >
              Create Yours
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <Link
            href="/create"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium shadow transition-colors sm:hidden"
          >
            Create
          </Link>
        </div>
      </div>
    </header>
  )
}
