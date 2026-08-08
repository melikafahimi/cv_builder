/**
 * ───────────────────────────────────────────────
 * Resume Domain Types
 * ───────────────────────────────────────────────
 * The single source of truth for the resume data model.
 * These types are kept in sync with the Zod schema in
 * `@/schemas/resume-schema` via `z.infer`.
 */

/** ISO date string, e.g. "2024-08-05". */
export type ISODateString = string

/** A universally unique identifier (client-side generated). */
export type UUID = string

/** Skill proficiency levels shown as badges / bars. */
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

/** Language proficiency per CEFR-style scale. */
export type LanguageProficiency =
  | 'beginner'
  | 'elementary'
  | 'intermediate'
  | 'advanced'
  | 'fluent'
  | 'native'

/** Available resume template identifiers. */
export type TemplateId =
  | 'modern'
  | 'classic'
  | 'creative'
  | 'professional'
  | 'executive'
  | 'safety'

/** Accent color theme applied to a template. */
export type AccentColor =
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'slate'
  | 'teal'

/** Font family choices for the resume canvas. */
export type ResumeFontFamily = 'sans' | 'serif' | 'mono'

/** Page size for PDF export. */
export type PageSize = 'a4' | 'letter' | 'legal'

/** Margins (mm) for the resume page. */
export interface PageMargins {
  top: number
  right: number
  bottom: number
  left: number
}

/** Personal / contact information block. */
export interface PersonalInfo {
  fullName: string
  jobTitle: string
  email: string
  phone: string
  /** Street address line. */
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  website: string
  linkedin: string
  github: string
  /** Optional avatar / profile picture URL. */
  photo: string
}

/** A single work experience entry. */
export interface Experience {
  id: UUID
  company: string
  position: string
  location: string
  startDate: string
  endDate: string
  /** Whether this role is ongoing. */
  current: boolean
  /** Bullet-point responsibilities. */
  description: string[]
}

/** A single education entry. */
export interface Education {
  id: UUID
  institution: string
  degree: string
  field: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  grade: string
  description: string
}

/** A single skill entry. */
export interface Skill {
  id: UUID
  name: string
  level: SkillLevel
  /** Optional category grouping, e.g. "Frontend". */
  category: string
}

/** A single certification entry. */
export interface Certification {
  id: UUID
  name: string
  issuer: string
  issueDate: string
  expiryDate: string
  credentialId: string
  credentialUrl: string
}

/** A single language entry. */
export interface Language {
  id: UUID
  name: string
  proficiency: LanguageProficiency
}

/** A single project entry. */
export interface Project {
  id: UUID
  name: string
  description: string
  url: string
  technologies: string[]
  startDate: string
  endDate: string
}

/** Custom section for user-defined content. */
export interface CustomSection {
  id: UUID
  title: string
  /** Each item is a paragraph / bullet. */
  items: string[]
}

/** Section identifiers that can be reordered / toggled. */
export type SectionId =
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'certifications'
  | 'languages'
  | 'projects'
  | 'custom'

/** Visibility + ordering metadata for a resume section. */
export interface SectionConfig {
  id: SectionId
  visible: boolean
  /** Stable sort order; lower renders first. */
  order: number
  /** Custom title override (e.g. "Work History"). */
  title: string
}

/** Styling / layout configuration for a resume. */
export interface ResumeStyle {
  template: TemplateId
  accentColor: AccentColor
  fontFamily: ResumeFontFamily
  fontSize: 'sm' | 'md' | 'lg'
  lineHeight: 'tight' | 'normal' | 'relaxed'
  pageSize: PageSize
  margins: PageMargins
}

/**
 * The complete resume document.
 * This is the canonical shape persisted to the DB and
 * held in the Zustand editor store.
 */
export interface Resume {
  id: UUID
  userId: UUID
  title: string
  slug: string
  personalInfo: PersonalInfo
  summary: string
  experiences: Experience[]
  educations: Education[]
  skills: Skill[]
  certifications: Certification[]
  languages: Language[]
  projects: Project[]
  customSections: CustomSection[]
  sections: SectionConfig[]
  style: ResumeStyle
  /** Whether the resume is publicly shareable. */
  isPublic: boolean
  isDraft: boolean
  createdAt: ISODateString
  updatedAt: ISODateString
}

/** Payload for creating a new resume (server assigns id/timestamps). */
export type ResumeCreateInput = Omit<
  Resume,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
> & {
  id?: UUID
}

/** Payload for patching an existing resume. */
export type ResumeUpdateInput = Partial<ResumeCreateInput> & {
  id: UUID
}

/** Lightweight resume reference for dashboard lists. */
export interface ResumeSummary {
  id: UUID
  title: string
  slug: string
  template: TemplateId
  isPublic: boolean
  isDraft: boolean
  updatedAt: ISODateString
  createdAt: ISODateString
}

/** Metadata describing a selectable template. */
export interface TemplateMeta {
  id: TemplateId
  name: string
  description: string
  /** Whether it uses a two-column layout. */
  twoColumn: boolean
  /** Thumbnail image path. */
  thumbnail: string
  /** Tags for filtering. */
  tags: string[]
  /** Whether the template is premium-only. */
  premium: boolean
}