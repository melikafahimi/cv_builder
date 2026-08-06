'use client'

import * as React from 'react'
import type { Resume } from '@/types'
import { useEditorStore, selectResume } from '@/store/editor-store'

/**
 * ───────────────────────────────────────────────
 * Resume Context
 * ───────────────────────────────────────────────
 * Exposes the current resume + a snapshot of editor
 * state to deeply-nested preview/template components
 * without prop-drilling. Reads from the Zustand store
 * and re-renders consumers on resume changes.
 */

interface ResumeContextValue {
  resume: Resume
  isDirty: boolean
}

const ResumeContext = React.createContext<ResumeContextValue | null>(null)

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const resume = useEditorStore(selectResume)
  const isDirty = useEditorStore((s) => s.isDirty)

  const value = React.useMemo<ResumeContextValue>(
    () => ({ resume, isDirty }),
    [resume, isDirty],
  )

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>
}

/** Hook to access the current resume from any child of `<ResumeProvider>`. */
export function useResumeContext(): ResumeContextValue {
  const ctx = React.useContext(ResumeContext)
  if (!ctx) {
    throw new Error('useResumeContext must be used within a <ResumeProvider>')
  }
  return ctx
}