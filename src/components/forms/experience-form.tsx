'use client'

import * as React from 'react'
import { useEditorStore } from '@/store/editor-store'
import type { Experience } from '@/types'
import {
  AddButton,
  AreaField,
  CheckField,
  EntryCard,
  TextField,
} from '@/components/editor/form-parts'

/**
 * ExperienceForm — work history entries with add /
 * remove / reorder support. Description bullets are
 * stored as an array, edited as newline-separated text.
 */
export function ExperienceForm() {
  const experiences = useEditorStore((s) => s.resume.experiences)
  const addExperience = useEditorStore((s) => s.addExperience)
  const updateExperience = useEditorStore((s) => s.updateExperience)
  const removeExperience = useEditorStore((s) => s.removeExperience)
  const reorderExperiences = useEditorStore((s) => s.reorderExperiences)

  return (
    <div className="space-y-4">
      {experiences.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          No work experience yet — add your first role below.
        </p>
      ) : (
        experiences.map((exp, index) => (
          <ExperienceEntry
            key={exp.id}
            exp={exp}
            index={index}
            total={experiences.length}
            onChange={(patch) => updateExperience(exp.id, patch)}
            onRemove={() => removeExperience(exp.id)}
            onMoveUp={
              index > 0 ? () => reorderExperiences(index, index - 1) : undefined
            }
            onMoveDown={
              index < experiences.length - 1
                ? () => reorderExperiences(index, index + 1)
                : undefined
            }
          />
        ))
      )}
      <AddButton label="Add Work Experience" onClick={addExperience} />
    </div>
  )
}

function ExperienceEntry({
  exp,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  exp: Experience
  index: number
  total: number
  onChange: (patch: Partial<Experience>) => void
  onRemove: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
}) {
  return (
    <EntryCard
      title={exp.position}
      subtitle={exp.company}
      index={index}
      total={total}
      onRemove={onRemove}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Position"
          value={exp.position}
          onChange={(v) => onChange({ position: v })}
          placeholder="Job title"
        />
        <TextField
          label="Company"
          value={exp.company}
          onChange={(v) => onChange({ company: v })}
          placeholder="Company name"
        />
      </div>
      <TextField
        label="Location"
        value={exp.location}
        onChange={(v) => onChange({ location: v })}
        placeholder="City, Country"
      />
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Start"
          type="month"
          value={exp.startDate}
          onChange={(v) => onChange({ startDate: v })}
        />
        <TextField
          label="End"
          type="month"
          value={exp.endDate}
          onChange={(v) => onChange({ endDate: v })}
          disabled={exp.current}
        />
      </div>
      <CheckField
        label="I currently work here"
        checked={exp.current}
        onChange={(current) => onChange({ current })}
      />
      <AreaField
        label="Achievements & Responsibilities"
        value={exp.description.join('\n')}
        onChange={(v) =>
          onChange({ description: v.split('\n').filter((line) => line.trim()) })
        }
        rows={4}
        placeholder={'One bullet per line:\n• Increased sales by 10%…'}
        hint="One achievement per line — each line becomes a bullet point on the resume."
      />
    </EntryCard>
  )
}
