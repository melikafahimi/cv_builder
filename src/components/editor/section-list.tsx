'use client'

import * as React from 'react'
import { useEditorStore } from '@/store/editor-store'
import { getVisibleSections } from '@/utils/resume'
import { SECTION_LABELS } from '@/constants/resume'
import type { SectionId } from '@/types'

/**
 * SectionList — renders the reorderable list of resume
 * sections. Each item is a `<DraggableSection>`.
 * Uses React DnD to reorder via the editor store.
 */
export function SectionList() {
  const sections = useEditorStore((s) => s.resume.sections)
  const selectedSection = useEditorStore((s) => s.selectedSection)
  const selectSection = useEditorStore((s) => s.selectSection)
  const toggleSectionVisibility = useEditorStore(
    (s) => s.toggleSectionVisibility,
  )
  const reorderSectionsList = useEditorStore((s) => s.reorderSectionsList)

  const visible = getVisibleSections(sections)

  return (
    <nav className="space-y-1 p-2">
      {visible.map((section, index) => (
        <div
          key={section.id}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm"
        >
          <span
            className="flex-1 cursor-pointer"
            onClick={() => selectSection(section.id as SectionId)}
          >
            {section.title || SECTION_LABELS[section.id]}
          </span>
          <button
            onClick={() => toggleSectionVisibility(section.id as SectionId)}
            className="text-xs text-muted-foreground"
          >
            {section.visible ? 'Hide' : 'Show'}
          </button>
        </div>
      ))}
    </nav>
  )
}