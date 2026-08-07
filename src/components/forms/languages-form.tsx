'use client'

import * as React from 'react'
import { useEditorStore } from '@/store/editor-store'
import type { Language, LanguageProficiency } from '@/types'
import { LANGUAGE_PROFICIENCY_OPTIONS } from '@/constants'
import {
  AddButton,
  EntryCard,
  SelectField,
  TextField,
} from '@/components/editor/form-parts'

/**
 * LanguagesForm — spoken languages with proficiency.
 */
export function LanguagesForm() {
  const languages = useEditorStore((s) => s.resume.languages)
  const addLanguage = useEditorStore((s) => s.addLanguage)
  const updateLanguage = useEditorStore((s) => s.updateLanguage)
  const removeLanguage = useEditorStore((s) => s.removeLanguage)

  return (
    <div className="space-y-4">
      {languages.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          No languages yet — add the ones you speak.
        </p>
      ) : (
        languages.map((lang, index) => (
          <EntryCard
            key={lang.id}
            title={lang.name}
            subtitle={lang.proficiency}
            index={index}
            total={languages.length}
            onRemove={() => removeLanguage(lang.id)}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_160px]">
              <TextField
                label="Language"
                value={lang.name}
                onChange={(v) => updateLanguage(lang.id, { name: v })}
                placeholder="e.g. English"
              />
              <SelectField
                label="Proficiency"
                value={lang.proficiency}
                onChange={(v) =>
                  updateLanguage(lang.id, {
                    proficiency: v as LanguageProficiency,
                  })
                }
                options={LANGUAGE_PROFICIENCY_OPTIONS}
              />
            </div>
          </EntryCard>
        ))
      )}
      <AddButton label="Add Language" onClick={addLanguage} />
    </div>
  )
}
