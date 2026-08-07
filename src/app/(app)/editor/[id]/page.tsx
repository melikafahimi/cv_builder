import type { Metadata } from 'next'
import { EditorPage } from '@/components/editor/editor-page'

export const metadata: Metadata = {
  title: 'Resume Builder',
  description:
    'Build your resume with live preview — edit sections on the left and watch the A4 page update in real time.',
}

/**
 * Resume editor page — the heart of the app.
 *
 * 1. `EditorPage` fetches the resume by `id` and hydrates the
 *    Zustand editor store (`useEditorStore.init`).
 * 2. `<ResumeEditor />` renders the two-pane workspace:
 *    - Left: section navigation + active section form
 *    - Right: live A4 preview with template/design controls
 * 3. Autosave persists changes via `useAutosave()`.
 */
export default async function EditorRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EditorPage resumeId={id} />
}
