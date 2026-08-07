'use client'

import * as React from 'react'
import { EDITOR_SECTIONS, type EditorSectionId } from './section-navigation'
import { PersonalInfoForm } from '@/components/forms/personal-info-form'
import { SummaryForm } from '@/components/forms/summary-form'
import { ExperienceForm } from '@/components/forms/experience-form'
import { EducationForm } from '@/components/forms/education-form'
import { SkillsForm } from '@/components/forms/skills-form'
import { CertificationsForm } from '@/components/forms/certifications-form'
import { LanguagesForm } from '@/components/forms/languages-form'
import { ProjectsForm } from '@/components/forms/projects-form'
import { CustomSectionForm } from '@/components/forms/custom-section-form'

/**
 * SectionForm — renders the form for the active section
 * with a matching header (icon, title, description).
 */
export function SectionForm({
  activeSection,
}: {
  activeSection: EditorSectionId
}) {
  const meta = EDITOR_SECTIONS.find((s) => s.id === activeSection)
  const Icon = meta?.icon

  return (
    <div className="space-y-5">
      <header className="flex items-start gap-3">
        {Icon ? (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="size-5" />
          </div>
        ) : null}
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {meta?.label}
          </h2>
          <p className="text-sm text-muted-foreground">{meta?.description}</p>
        </div>
      </header>

      {activeSection === 'personal' ? <PersonalInfoForm /> : null}
      {activeSection === 'summary' ? <SummaryForm /> : null}
      {activeSection === 'experience' ? <ExperienceForm /> : null}
      {activeSection === 'education' ? <EducationForm /> : null}
      {activeSection === 'skills' ? <SkillsForm /> : null}
      {activeSection === 'certifications' ? <CertificationsForm /> : null}
      {activeSection === 'languages' ? <LanguagesForm /> : null}
      {activeSection === 'projects' ? <ProjectsForm /> : null}
      {activeSection === 'custom' ? <CustomSectionForm /> : null}
    </div>
  )
}
