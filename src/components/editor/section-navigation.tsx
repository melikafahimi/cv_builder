'use client'

import * as React from 'react'
import {
  AlignLeft,
  Award,
  Briefcase,
  Eye,
  EyeOff,
  FolderGit2,
  GraduationCap,
  Languages,
  ListPlus,
  UserRound,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { useEditorStore } from '@/store/editor-store'
import { cn } from '@/lib/utils'
import type { SectionId } from '@/types'

/** Editor sections including the fixed "Personal Info" block. */
export type EditorSectionId = SectionId | 'personal'

export const EDITOR_SECTIONS: {
  id: EditorSectionId
  label: string
  icon: LucideIcon
  description: string
}[] = [
  {
    id: 'personal',
    label: 'Personal Info',
    icon: UserRound,
    description: 'Name, contact details and links.',
  },
  {
    id: 'summary',
    label: 'Summary',
    icon: AlignLeft,
    description: 'Your professional profile in a few sentences.',
  },
  {
    id: 'experience',
    label: 'Experience',
    icon: Briefcase,
    description: 'Work history, roles and achievements.',
  },
  {
    id: 'education',
    label: 'Education',
    icon: GraduationCap,
    description: 'Degrees, diplomas and academic details.',
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: Wrench,
    description: 'Key competencies and proficiency levels.',
  },
  {
    id: 'certifications',
    label: 'Certifications',
    icon: Award,
    description: 'Licenses and professional certificates.',
  },
  {
    id: 'languages',
    label: 'Languages',
    icon: Languages,
    description: 'Languages you speak and your level.',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderGit2,
    description: 'Side projects and open-source work.',
  },
  {
    id: 'custom',
    label: 'Custom Section',
    icon: ListPlus,
    description: 'Anything else — volunteering, awards, publications.',
  },
]

interface SectionNavigationProps {
  activeSection: EditorSectionId
  onSelect: (section: EditorSectionId) => void
}

/**
 * SectionNavigation — the vertical rail of editable
 * sections. Clicking selects the active form; the eye
 * toggles whether the section renders on the resume.
 */
export function SectionNavigation({
  activeSection,
  onSelect,
}: SectionNavigationProps) {
  const sections = useEditorStore((s) => s.resume.sections)
  const toggleSectionVisibility = useEditorStore(
    (s) => s.toggleSectionVisibility,
  )
  const counts = useEditorStore((s) => ({
    experience: s.resume.experiences.length,
    education: s.resume.educations.length,
    skills: s.resume.skills.length,
    certifications: s.resume.certifications.length,
    languages: s.resume.languages.length,
    projects: s.resume.projects.length,
    custom: s.resume.customSections.length,
  }))

  return (
    <nav className="space-y-1 p-3">
      <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        Sections
      </p>
      {EDITOR_SECTIONS.map((section) => {
        const Icon = section.icon
        const isActive = activeSection === section.id
        const config = sections.find((s) => s.id === section.id)
        const isVisible = config?.visible ?? true
        const count =
          section.id === 'personal'
            ? undefined
            : counts[section.id as keyof typeof counts]

        return (
          <div
            key={section.id}
            role="button"
            tabIndex={0}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => onSelect(section.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(section.id)
              }
            }}
            className={cn(
              'group flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
            )}
          >
            <Icon
              className={cn(
                'size-4 shrink-0',
                isActive ? 'text-primary' : 'text-muted-foreground/70',
              )}
            />
            <span className="min-w-0 flex-1 truncate">{section.label}</span>
            {typeof count === 'number' && count > 0 ? (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                {count}
              </span>
            ) : null}
            {section.id !== 'personal' ? (
              <button
                type="button"
                aria-label={isVisible ? 'Hide section' : 'Show section'}
                title={isVisible ? 'Hide from resume' : 'Show on resume'}
                className={cn(
                  'shrink-0 rounded p-1 transition-colors',
                  isVisible
                    ? 'text-muted-foreground/60 hover:text-foreground'
                    : 'text-muted-foreground/30 hover:text-foreground',
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSectionVisibility(section.id as SectionId)
                }}
              >
                {isVisible ? (
                  <Eye className="size-3.5" />
                ) : (
                  <EyeOff className="size-3.5" />
                )}
              </button>
            ) : null}
          </div>
        )
      })}
    </nav>
  )
}
