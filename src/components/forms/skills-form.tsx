'use client'

import * as React from 'react'
import { useEditorStore } from '@/store/editor-store'
import type { Skill, SkillLevel } from '@/types'
import { SKILL_LEVEL_OPTIONS } from '@/constants'
import {
  AddButton,
  EntryCard,
  SelectField,
  TextField,
} from '@/components/editor/form-parts'

/**
 * SkillsForm — skill entries with proficiency levels.
 */
export function SkillsForm() {
  const skills = useEditorStore((s) => s.resume.skills)
  const addSkill = useEditorStore((s) => s.addSkill)
  const updateSkill = useEditorStore((s) => s.updateSkill)
  const removeSkill = useEditorStore((s) => s.removeSkill)
  const reorderSkills = useEditorStore((s) => s.reorderSkills)

  return (
    <div className="space-y-4">
      {skills.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          No skills yet — add the ones that matter for the role you are applying
          to.
        </p>
      ) : (
        skills.map((skill, index) => (
          <EntryCard
            key={skill.id}
            title={skill.name}
            subtitle={skill.level}
            index={index}
            total={skills.length}
            onRemove={() => removeSkill(skill.id)}
            onMoveUp={
              index > 0 ? () => reorderSkills(index, index - 1) : undefined
            }
            onMoveDown={
              index < skills.length - 1
                ? () => reorderSkills(index, index + 1)
                : undefined
            }
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
              <TextField
                label="Skill"
                value={skill.name}
                onChange={(v) => updateSkill(skill.id, { name: v })}
                placeholder="e.g. JavaScript"
              />
              <SelectField
                label="Level"
                value={skill.level}
                onChange={(v) =>
                  updateSkill(skill.id, { level: v as SkillLevel })
                }
                options={SKILL_LEVEL_OPTIONS}
              />
            </div>
            <TextField
              label="Category"
              value={skill.category}
              onChange={(v) => updateSkill(skill.id, { category: v })}
              placeholder="e.g. Frontend (optional)"
            />
          </EntryCard>
        ))
      )}
      <AddButton label="Add Skill" onClick={addSkill} />
    </div>
  )
}
