import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Build your professional resume',
  description:
    'Create a polished, ATS-friendly resume in minutes with live preview, drag-and-drop sections, and one-click PDF export.',
}

/**
 * Landing / marketing page.
 * UI implementation is out of scope — this route
 * establishes the architecture entry point.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Marketing hero, features, templates, CTA — to be implemented */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            CV Builder
          </h1>
          <p className="mt-4 text-muted-foreground">
            Architecture scaffold — UI coming soon.
          </p>
        </div>
      </div>
    </main>
  )
}