import { AppShell } from '@/components/layout/app-shell'

/**
 * Authenticated app layout.
 * Wraps dashboard routes with the app sidebar + topbar.
 * The editor route renders full-bleed inside `AppShell`.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
