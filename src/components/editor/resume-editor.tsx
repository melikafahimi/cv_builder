'use client'

import * as React from 'react'
import { ResumeProvider } from '@/context/resume-provider'
import { useAutosave } from '@/hooks/use-autosave'
import type { Resume } from '@/types'

/**
 * ───────────────────────────────────────────────
 * ResumeEditor
 * ───────────────────────────────────────────────
 * The left pane of the editor. Orchestrates:
 *  - Section tabs / accordion navigation
 *  - Form rendering for each section
 *  - Drag-and-drop section reordering
 *  - Autosave lifecycle
 *
 * Wraps the entire editor tree in `<ResumeProvider>`
 * so preview/template components can read state.
 */

interface ResumeEditorProps {
  resumeId: string
  initialResume?: Resume
}

export function ResumeEditor({ resumeId, initialResume }: ResumeEditorProps) {
  useAutosave()

  return (
    <ResumeProvider>
      <div className="flex h-full flex-col overflow-hidden">
        {/* Editor toolbar — to be implemented */}
        {/* Section navigation (DnD) — to be implemented */}
        {/* Active section form — to be implemented */}
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          Resume editor scaffold — UI coming soon.
        </div>
      </div>
    </ResumeProvider>
  )
}