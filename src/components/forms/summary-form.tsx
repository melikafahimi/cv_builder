'use client'

import * as React from 'react'
import { useEditorStore } from '@/store/editor-store'
import { AreaField } from '@/components/editor/form-parts'

/**
 * SummaryForm — the professional profile / objective paragraph.
 */
export function SummaryForm() {
  const summary = useEditorStore((s) => s.resume.summary)
  const setSummary = useEditorStore((s) => s.setSummary)

  return (
    <AreaField
      label="Professional Summary"
      value={summary}
      onChange={setSummary}
      rows={6}
      placeholder="Write a short paragraph about yourself, your strengths and career goals…"
      hint="A strong summary is 2–4 sentences that highlight your experience and value."
    />
  )
}
