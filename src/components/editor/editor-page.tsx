'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { useResume } from '@/hooks/use-resumes'
import { useEditorStore } from '@/store/editor-store'
import { ResumeEditor } from '@/components/editor/resume-editor'

/**
 * ───────────────────────────────────────────────
 * EditorPage
 * ───────────────────────────────────────────────
 * Loads the resume by id (TanStack Query) and
 * hydrates the Zustand editor store. When the API
 * has no record for the id (fresh demo, unsaved
 * resume), the editor falls back to the locally
 * persisted resume — or a rich sample resume on the
 * very first visit so the preview has content to show.
 * ───────────────────────────────────────────────
 */

export function EditorPage({ resumeId }: { resumeId: string }) {
  const { data, isPending, isError } = useResume(resumeId)
  const init = useEditorStore((s) => s.init)
  const resume = useEditorStore((s) => s.resume)
  const loadSample = useEditorStore((s) => s.loadSample)
  const hydrated = React.useRef(false)

  React.useEffect(() => {
    if (hydrated.current) return
    if (data) {
      init(data)
      hydrated.current = true
    } else if (isError) {
      const empty =
        !resume.personalInfo.fullName &&
        !resume.summary &&
        resume.experiences.length === 0 &&
        resume.educations.length === 0 &&
        resume.skills.length === 0
      if (empty) {
        loadSample()
      }
      hydrated.current = true
    }
  }, [data, isError, init, loadSample, resume])

  if (isPending) {
    return (
      <div className="flex h-full flex-1 items-center justify-center bg-muted/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading resume…
        </div>
      </div>
    )
  }

  return <ResumeEditor />
}
