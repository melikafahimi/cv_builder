import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Overview of your resumes and account.',
}

/**
 * Dashboard home — architecture placeholder.
 * Will display resume summaries, completion scores,
 * and quick actions via TanStack Query hooks.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      {/* <ResumeList /> <QuickActions /> — to be implemented */}
    </div>
  )
}