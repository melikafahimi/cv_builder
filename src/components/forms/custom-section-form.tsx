'use client'

import * as React from 'react'
import { useEditorStore } from '@/store/editor-store'
import type { CustomSection } from '@/types'
import {
  AddButton,
  AreaField,
  EntryCard,
  TextField,
} from '@/components/editor/form-parts'

/**
 * CustomSectionForm — user-defined sections with free-form items.
 */
export function CustomSectionForm() {
  const customSections = useEditorStore((s) => s.resume.customSections)
  const addCustomSection = useEditorStore((s) => s.addCustomSection)
  const updateCustomSection = useEditorStore((s) => s.updateCustomSection)
  const removeCustomSection = useEditorStore((s) => s.removeCustomSection)

  return (
    <div className="space-y-4">
      {customSections.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          No custom sections yet — add e.g. “Volunteering”, “Publications” or
          “Awards”.
        </p>
      ) : (
        customSections.map((section, index) => (
          <EntryCard
            key={section.id}
            title={section.title}
            index={index}
            total={customSections.length}
            onRemove={() => removeCustomSection(section.id)}
          >
            <CustomSectionEntry
              section={section}
              onChange={(patch) => updateCustomSection(section.id, patch)}
            />
          </EntryCard>
        ))
      )}
      <AddButton label="Add Custom Section" onClick={addCustomSection} />
    </div>
  )
}

function CustomSectionEntry({
  section,
  onChange,
}: {
  section: CustomSection
  onChange: (patch: Partial<CustomSection>) => void
}) {
  return (
    <div className="space-y-3">
      <TextField
        label="Section Title"
        value={section.title}
        onChange={(v) => onChange({ title: v })}
        placeholder="e.g. Volunteering"
      />
      <AreaField
        label="Items"
        value={section.items.join('\n')}
        onChange={(v) =>
          onChange({ items: v.split('\n').filter((line) => line.trim()) })
        }
        rows={4}
        placeholder={'One item per line:\n• Organized community events…'}
        hint="One item per line — each line becomes a bullet point."
      />
    </div>
  )
}
