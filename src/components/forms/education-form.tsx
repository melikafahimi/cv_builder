'use client'

import * as React from 'react'
import { useEditorStore } from '@/store/editor-store'
import type { Education } from '@/types'
import {
  AddButton,
  AreaField,
  CheckField,
  EntryCard,
  TextField,
} from '@/components/editor/form-parts'

/**
 * EducationForm — academic history entries.
 */
export function EducationForm() {
  const educations = useEditorStore((s) => s.resume.educations)
  const addEducation = useEditorStore((s) => s.addEducation)
  const updateEducation = useEditorStore((s) => s.updateEducation)
  const removeEducation = useEditorStore((s) => s.removeEducation)
  const reorderEducations = useEditorStore((s) => s.reorderEducations)

  return (
    <div className="space-y-4">
      {educations.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          No education added yet — add your first entry below.
        </p>
      ) : (
        educations.map((edu, index) => (
          <EntryCard
            key={edu.id}
            title={edu.degree}
            subtitle={edu.institution}
            index={index}
            total={educations.length}
            onRemove={() => removeEducation(edu.id)}
            onMoveUp={
              index > 0 ? () => reorderEducations(index, index - 1) : undefined
            }
            onMoveDown={
              index < educations.length - 1
                ? () => reorderEducations(index, index + 1)
                : undefined
            }
          >
            <EducationEntry
              edu={edu}
              onChange={(patch) => updateEducation(edu.id, patch)}
            />
          </EntryCard>
        ))
      )}
      <AddButton label="Add Education" onClick={addEducation} />
    </div>
  )
}

function EducationEntry({
  edu,
  onChange,
}: {
  edu: Education
  onChange: (patch: Partial<Education>) => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Degree"
          value={edu.degree}
          onChange={(v) => onChange({ degree: v })}
          placeholder="e.g. Bachelor of Science"
        />
        <TextField
          label="Field of Study"
          value={edu.field}
          onChange={(v) => onChange({ field: v })}
          placeholder="e.g. Computer Science"
        />
      </div>
      <TextField
        label="Institution"
        value={edu.institution}
        onChange={(v) => onChange({ institution: v })}
        placeholder="University / College"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Location"
          value={edu.location}
          onChange={(v) => onChange({ location: v })}
          placeholder="City, Country"
        />
        <TextField
          label="Grade / GPA"
          value={edu.grade}
          onChange={(v) => onChange({ grade: v })}
          placeholder="Optional"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Start"
          type="month"
          value={edu.startDate}
          onChange={(v) => onChange({ startDate: v })}
        />
        <TextField
          label="End"
          type="month"
          value={edu.endDate}
          onChange={(v) => onChange({ endDate: v })}
          disabled={edu.current}
        />
      </div>
      <CheckField
        label="I currently study here"
        checked={edu.current}
        onChange={(current) => onChange({ current })}
      />
      <AreaField
        label="Description"
        value={edu.description}
        onChange={(v) => onChange({ description: v })}
        rows={2}
        placeholder="Thesis, honors, activities… (optional)"
      />
    </div>
  )
}
