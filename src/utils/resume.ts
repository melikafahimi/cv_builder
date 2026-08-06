import type {
  Resume,
  SectionConfig,
  SectionId,
  Experience,
  Education,
  Skill,
} from '@/types'
import { generateId } from './id'

/**
 * ───────────────────────────────────────────────
 * Resume data manipulation helpers
 * ───────────────────────────────────────────────
 */

/** Return only the visible sections, sorted by their `order`. */
export function getVisibleSections(sections: SectionConfig[]): SectionConfig[] {
  return [...sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order)
}

/** Toggle a section's visibility by id. */
export function toggleSection(
  sections: SectionConfig[],
  id: SectionId,
): SectionConfig[] {
  return sections.map((s) =>
    s.id === id ? { ...s, visible: !s.visible } : s,
  )
}

/** Reorder sections by swapping two indices. */
export function reorderSections(
  sections: SectionConfig[],
  from: number,
  to: number,
): SectionConfig[] {
  const next = [...sections]
  const [moved] = next.splice(from, 1)
  if (moved) next.splice(to, 0, moved)
  return next.map((s, i) => ({ ...s, order: i }))
}

/** Factory for a new empty experience entry. */
export function createEmptyExperience(): Experience {
  return {
    id: generateId(),
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: [],
  }
}

/** Factory for a new empty education entry. */
export function createEmptyEducation(): Education {
  return {
    id: generateId(),
    institution: '',
    degree: '',
    field: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    grade: '',
    description: '',
  }
}

/** Factory for a new empty skill entry. */
export function createEmptySkill(): Skill {
  return {
    id: generateId(),
    name: '',
    level: 'intermediate',
    category: '',
  }
}

/** Compute a 0–100 completion percentage for a resume. */
export function getCompletionScore(resume: Resume): number {
  const checks: boolean[] = [
    Boolean(resume.personalInfo.fullName),
    Boolean(resume.personalInfo.jobTitle),
    Boolean(resume.personalInfo.email),
    Boolean(resume.personalInfo.phone),
    Boolean(resume.summary.length > 20),
    resume.experiences.length > 0,
    resume.educations.length > 0,
    resume.skills.length > 0,
  ]
  const passed = checks.filter(Boolean).length
  return Math.round((passed / checks.length) * 100)
}

/** Deep-clone a resume and stamp a new id/timestamps (for duplication). */
export function duplicateResume(resume: Resume): Resume {
  const now = new Date().toISOString()
  return {
    ...structuredClone(resume),
    id: generateId(),
    title: `${resume.title} (Copy)`,
    slug: '',
    isDraft: true,
    createdAt: now,
    updatedAt: now,
  }
}