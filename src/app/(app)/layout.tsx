/**
 * Authenticated app layout.
 * Wraps dashboard routes with the app sidebar + topbar.
 * UI components will live in `@/components/layout`.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* <AppSidebar /> <AppTopbar /> — to be implemented */}
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r md:block">
          {/* Sidebar nav — to be implemented */}
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}