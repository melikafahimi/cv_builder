'use client'

import * as React from 'react'
import { useEditorStore, AUTOSAVE_DELAY } from '@/store/editor-store'
import { resumeService } from '@/services/resume.service'
import { toast } from 'sonner'
import type { Resume } from '@/types'

/**
 * ───────────────────────────────────────────────
 * useAutosave
 * ───────────────────────────────────────────────
 * Watches the editor store for dirty changes and
 * automatically persists the resume to the API after
 * a debounce period. No-ops for unsaved (id-less)
 * resumes until the first explicit save.
 */
export function useAutosave(enabled = true) {
  const resume = useEditorStore((s) => s.resume)
  const isDirty = useEditorStore((s) => s.isDirty)
  const setSaveStatus = useEditorStore((s) => s.setSaveStatus)
  const markSaved = useEditorStore((s) => s.markSaved)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    if (!enabled || !isDirty || !resume.id) return

    setSaveStatus('saving')
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      try {
        await resumeService.update({ ...resume, id: resume.id } as Resume)
        markSaved()
      } catch (error) {
        setSaveStatus('error')
        toast.error('Autosave failed', {
          description:
            error instanceof Error ? error.message : 'Please try again.',
        })
      }
    }, AUTOSAVE_DELAY)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [resume, isDirty, enabled, setSaveStatus, markSaved])
}
