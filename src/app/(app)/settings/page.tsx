import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your account and preferences.',
}

/**
 * Settings page — architecture placeholder.
 * Will host profile, security, and billing sections.
 */
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      {/* <ProfileSettings /> <SecuritySettings /> — to be implemented */}
    </div>
  )
}
