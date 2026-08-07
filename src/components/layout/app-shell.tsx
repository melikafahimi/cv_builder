'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowLeftRight,
  FileText,
  LayoutDashboard,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * ───────────────────────────────────────────────
 * AppShell
 * ───────────────────────────────────────────────
 * The authenticated app frame. Renders the sidebar
 * navigation on regular app pages and switches to a
 * full-bleed surface for the resume editor so the
 * builder gets the entire viewport.
 */

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Resume Builder', href: '/editor/demo', icon: ArrowLeftRight },
  { label: 'My Resumes', href: '/dashboard', icon: FileText },
  { label: 'Settings', href: '/settings', icon: Settings },
] as const

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEditor = pathname.startsWith('/editor')

  if (isEditor) {
    return <div className="flex h-screen flex-col">{children}</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 flex-col border-r bg-muted/30 md:flex">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 border-b px-5 py-4 font-semibold tracking-tight"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="size-4" />
            </span>
            CV Builder
          </Link>
          <nav className="flex-1 space-y-1 p-3">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
                    active && 'bg-accent text-accent-foreground',
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="border-t p-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Free plan</p>
            <p className="mt-0.5">2 of 3 resumes used</p>
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
