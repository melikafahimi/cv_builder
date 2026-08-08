import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  Resume,
  PersonalInfo,
  Experience,
  Education,
  Skill,
  Certification,
  Language,
  Project,
  CustomSection,
  SectionConfig,
  SectionId,
  ResumeStyle,
  TemplateId,
  AccentColor,
} from '@/types'
import { createEmptyResume } from '@/constants/resume'
import {
  createEmptyExperience,
  createEmptyEducation,
  createEmptySkill,
  reorderSections,
  toggleSection,
} from '@/utils/resume'
import { generateId } from '@/utils/id'
import { STORAGE_KEYS, AUTOSAVE_DELAY } from '@/constants'

/**
 * ───────────────────────────────────────────────
 * Editor Store (Zustand)
 * ───────────────────────────────────────────────
 * The single source of truth for the resume being
 * edited. Supports granular updates to any nested
 * field, section reordering, and autosave status.
 */

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface EditorState {
  resume: Resume
  isDirty: boolean
  saveStatus: SaveStatus
  lastSavedAt: string | null
  selectedSection: SectionId | null

  // Lifecycle
  init: (resume?: Resume) => void
  reset: () => void
  loadSample: () => void

  // Top-level
  setTitle: (title: string) => void
  setSummary: (summary: string) => void
  setStyle: (style: Partial<ResumeStyle>) => void
  setTemplate: (template: TemplateId) => void
  setAccentColor: (color: AccentColor) => void

  // Personal info
  updatePersonalInfo: (patch: Partial<PersonalInfo>) => void

  // Array sections
  addExperience: () => void
  updateExperience: (id: string, patch: Partial<Experience>) => void
  removeExperience: (id: string) => void
  reorderExperiences: (from: number, to: number) => void

  addEducation: () => void
  updateEducation: (id: string, patch: Partial<Education>) => void
  removeEducation: (id: string) => void
  reorderEducations: (from: number, to: number) => void

  addSkill: () => void
  updateSkill: (id: string, patch: Partial<Skill>) => void
  removeSkill: (id: string) => void
  reorderSkills: (from: number, to: number) => void

  addCertification: () => void
  updateCertification: (id: string, patch: Partial<Certification>) => void
  removeCertification: (id: string) => void

  addLanguage: () => void
  updateLanguage: (id: string, patch: Partial<Language>) => void
  removeLanguage: (id: string) => void

  addProject: () => void
  updateProject: (id: string, patch: Partial<Project>) => void
  removeProject: (id: string) => void

  addCustomSection: () => void
  updateCustomSection: (id: string, patch: Partial<CustomSection>) => void
  removeCustomSection: (id: string) => void

  // Section config
  toggleSectionVisibility: (id: SectionId) => void
  reorderSectionsList: (from: number, to: number) => void
  setSectionTitle: (id: SectionId, title: string) => void
  selectSection: (id: SectionId | null) => void

  // Save status
  setSaveStatus: (status: SaveStatus) => void
  markSaved: () => void
}

/** Helper to update an item in an array by id. */
function updateById<T extends { id: string }>(
  arr: T[],
  id: string,
  patch: Partial<T>,
): T[] {
  return arr.map((item) => (item.id === id ? { ...item, ...patch } : item))
}

/** Helper to remove an item from an array by id. */
function removeById<T extends { id: string }>(arr: T[], id: string): T[] {
  return arr.filter((item) => item.id !== id)
}

/** Helper to reorder an array by swapping two indices. */
function reorder<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr]
  const [moved] = next.splice(from, 1)
  if (moved) next.splice(to, 0, moved)
  return next
}

export const useEditorStore = create<EditorState>()(
  devtools(
    persist(
      (set) => ({
        resume: createEmptyResume(),
        isDirty: false,
        saveStatus: 'idle',
        lastSavedAt: null,
        selectedSection: null,

        init: (resume) =>
          set({ resume: resume ?? createEmptyResume(), isDirty: false }, false, 'init'),

        reset: () =>
          set(
            { resume: createEmptyResume(), isDirty: false, saveStatus: 'idle' },
            false,
            'reset',
          ),

        loadSample: () => {
          // Lazy import to avoid circular dependency with constants
          import('@/constants/resume').then(({ createSampleResume }) => {
            set({ resume: createSampleResume(), isDirty: true }, false, 'loadSample')
          })
        },

        setTitle: (title) =>
          set(
            (s) => ({ resume: { ...s.resume, title }, isDirty: true }),
            false,
            'setTitle',
          ),

        setSummary: (summary) =>
          set(
            (s) => ({ resume: { ...s.resume, summary }, isDirty: true }),
            false,
            'setSummary',
          ),

        setStyle: (style) =>
          set(
            (s) => ({
              resume: { ...s.resume, style: { ...s.resume.style, ...style } },
              isDirty: true,
            }),
            false,
            'setStyle',
          ),

        setTemplate: (template) =>
          set(
            (s) => ({
              resume: { ...s.resume, style: { ...s.resume.style, template } },
              isDirty: true,
            }),
            false,
            'setTemplate',
          ),

        setAccentColor: (accentColor) =>
          set(
            (s) => ({
              resume: { ...s.resume, style: { ...s.resume.style, accentColor } },
              isDirty: true,
            }),
            false,
            'setAccentColor',
          ),

        updatePersonalInfo: (patch) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                personalInfo: { ...s.resume.personalInfo, ...patch },
              },
              isDirty: true,
            }),
            false,
            'updatePersonalInfo',
          ),

        // ── Experience ──
        addExperience: () =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                experiences: [...s.resume.experiences, createEmptyExperience()],
              },
              isDirty: true,
            }),
            false,
            'addExperience',
          ),

        updateExperience: (id, patch) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                experiences: updateById(s.resume.experiences, id, patch),
              },
              isDirty: true,
            }),
            false,
            'updateExperience',
          ),

        removeExperience: (id) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                experiences: removeById(s.resume.experiences, id),
              },
              isDirty: true,
            }),
            false,
            'removeExperience',
          ),

        reorderExperiences: (from, to) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                experiences: reorder(s.resume.experiences, from, to),
              },
              isDirty: true,
            }),
            false,
            'reorderExperiences',
          ),

        // ── Education ──
        addEducation: () =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                educations: [...s.resume.educations, createEmptyEducation()],
              },
              isDirty: true,
            }),
            false,
            'addEducation',
          ),

        updateEducation: (id, patch) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                educations: updateById(s.resume.educations, id, patch),
              },
              isDirty: true,
            }),
            false,
            'updateEducation',
          ),

        removeEducation: (id) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                educations: removeById(s.resume.educations, id),
              },
              isDirty: true,
            }),
            false,
            'removeEducation',
          ),

        reorderEducations: (from, to) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                educations: reorder(s.resume.educations, from, to),
              },
              isDirty: true,
            }),
            false,
            'reorderEducations',
          ),

        // ── Skills ──
        addSkill: () =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                skills: [...s.resume.skills, createEmptySkill()],
              },
              isDirty: true,
            }),
            false,
            'addSkill',
          ),

        updateSkill: (id, patch) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                skills: updateById(s.resume.skills, id, patch),
              },
              isDirty: true,
            }),
            false,
            'updateSkill',
          ),

        removeSkill: (id) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                skills: removeById(s.resume.skills, id),
              },
              isDirty: true,
            }),
            false,
            'removeSkill',
          ),

        reorderSkills: (from, to) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                skills: reorder(s.resume.skills, from, to),
              },
              isDirty: true,
            }),
            false,
            'reorderSkills',
          ),

        // ── Certifications ──
        addCertification: () =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                certifications: [
                  ...s.resume.certifications,
                  {
                    id: generateId(),
                    name: '',
                    issuer: '',
                    issueDate: '',
                    expiryDate: '',
                    credentialId: '',
                    credentialUrl: '',
                  },
                ],
              },
              isDirty: true,
            }),
            false,
            'addCertification',
          ),

        updateCertification: (id, patch) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                certifications: updateById(s.resume.certifications, id, patch),
              },
              isDirty: true,
            }),
            false,
            'updateCertification',
          ),

        removeCertification: (id) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                certifications: removeById(s.resume.certifications, id),
              },
              isDirty: true,
            }),
            false,
            'removeCertification',
          ),

        // ── Languages ──
        addLanguage: () =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                languages: [
                  ...s.resume.languages,
                  { id: generateId(), name: '', proficiency: 'intermediate' },
                ],
              },
              isDirty: true,
            }),
            false,
            'addLanguage',
          ),

        updateLanguage: (id, patch) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                languages: updateById(s.resume.languages, id, patch),
              },
              isDirty: true,
            }),
            false,
            'updateLanguage',
          ),

        removeLanguage: (id) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                languages: removeById(s.resume.languages, id),
              },
              isDirty: true,
            }),
            false,
            'removeLanguage',
          ),

        // ── Projects ──
        addProject: () =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                projects: [
                  ...s.resume.projects,
                  {
                    id: generateId(),
                    name: '',
                    description: '',
                    url: '',
                    technologies: [],
                    startDate: '',
                    endDate: '',
                  },
                ],
              },
              isDirty: true,
            }),
            false,
            'addProject',
          ),

        updateProject: (id, patch) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                projects: updateById(s.resume.projects, id, patch),
              },
              isDirty: true,
            }),
            false,
            'updateProject',
          ),

        removeProject: (id) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                projects: removeById(s.resume.projects, id),
              },
              isDirty: true,
            }),
            false,
            'removeProject',
          ),

        // ── Custom sections ──
        addCustomSection: () =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                customSections: [
                  ...s.resume.customSections,
                  { id: generateId(), title: 'New Section', items: [] },
                ],
              },
              isDirty: true,
            }),
            false,
            'addCustomSection',
          ),

        updateCustomSection: (id, patch) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                customSections: updateById(s.resume.customSections, id, patch),
              },
              isDirty: true,
            }),
            false,
            'updateCustomSection',
          ),

        removeCustomSection: (id) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                customSections: removeById(s.resume.customSections, id),
              },
              isDirty: true,
            }),
            false,
            'removeCustomSection',
          ),

        // ── Section config ──
        toggleSectionVisibility: (id) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                sections: toggleSection(s.resume.sections, id),
              },
              isDirty: true,
            }),
            false,
            'toggleSectionVisibility',
          ),

        reorderSectionsList: (from, to) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                sections: reorderSections(s.resume.sections, from, to),
              },
              isDirty: true,
            }),
            false,
            'reorderSectionsList',
          ),

        setSectionTitle: (id, title) =>
          set(
            (s) => ({
              resume: {
                ...s.resume,
                sections: s.resume.sections.map((sec) =>
                  sec.id === id ? { ...sec, title } : sec,
                ) as SectionConfig[],
              },
              isDirty: true,
            }),
            false,
            'setSectionTitle',
          ),

        selectSection: (id) =>
          set({ selectedSection: id }, false, 'selectSection'),

        // ── Save status ──
        setSaveStatus: (saveStatus) =>
          set({ saveStatus }, false, 'setSaveStatus'),

        markSaved: () =>
          set(
            {
              isDirty: false,
              saveStatus: 'saved',
              lastSavedAt: new Date().toISOString(),
            },
            false,
            'markSaved',
          ),
      }),
      {
        name: STORAGE_KEYS.EDITOR_STATE,
        // Only persist the resume document, not transient UI flags
        partialize: (state) => ({ resume: state.resume }),
      },
    ),
    { name: 'EditorStore' },
  ),
)

/** Convenience selector for the current resume. */
export const selectResume = (s: EditorState): Resume => s.resume

/** Convenience selector for dirty state. */
export const selectIsDirty = (s: EditorState): boolean => s.isDirty

/** Autosave delay in ms (re-exported for hooks). */
export { AUTOSAVE_DELAY }