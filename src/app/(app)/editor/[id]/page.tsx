import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resume Editor',
  description: 'Edit your resume with a live preview.',
}

/**
 * Resume editor page — architecture placeholder.
 *
 * This is the heart of the app. It will:
 *  1. Fetch the resume by `id` (TanStack Query `useResume`)
 *  2. Hydrate the Zustand editor store (`useEditorStore.init`)
 *  3. Render the two-pane editor:
 *     - Left:  `<ResumeEditor />` (forms + DnD sections)
 *     - Right: `<ResumePreview />` (live template render)
 *  4. Enable autosave via `useAutosave()`
 *  5. Wrap children in `<ResumeProvider />`
 */
export default function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 gap-0 lg:grid-cols-2">
      {/* <ResumeEditor resumeId={id} /> — to be implemented */}
      {/* <ResumePreview /> — to be implemented */}
      <div className="flex items-center justify-center text-muted-foreground">
        Editor scaffold — UI coming soon.
      </div>
    </div>
  )
}