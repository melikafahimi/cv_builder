import { z } from 'zod'

/**
 * ───────────────────────────────────────────────
 * Global Resume Schema (Zod)
 * ───────────────────────────────────────────────
 * The single validation source of truth. Types in
 * `@/types/resume` are derived from these schemas via
 * `z.infer`, keeping runtime validation and compile-time
 * types perfectly in sync.
 *
 * Used by React Hook Form (`@hookform/resolvers/zod`)
 * for every form in the editor.
 */

// ── Primitives ──────────────────────────────────

/** Non-empty trimmed string. */
const nonEmpty = z.string().trim().min(1, 'This field is required')

/** Optional string that defaults to empty. */
const optionalString = z.string().trim().default('')

/** Email with a permissive-but-real validation. */
const emailField = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

/** URL that may be empty. */
const optionalUrl = z
  .string()
  .trim()
  .url('Please enter a valid URL')
  .or(z.literal(''))
  .default('')

/** ISO-ish date string (YYYY-MM or YYYY-MM-DD). */
const dateField = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}(-\d{2})?$/, 'Use the format YYYY-MM')
  .or(z.literal(''))
  .default('')

// ── Enums ───────────────────────────────────────

export const skillLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
])

export const languageProficiencySchema = z.enum([
  'beginner',
  'elementary',
  'intermediate',
  'advanced',
  'fluent',
  'native',
])

export const templateIdSchema = z.enum([
  'modern',
  'classic',
  'creative',
  'professional',
  'executive',
  'safety',
])

export const accentColorSchema = z.enum([
  'blue',
  'indigo',
  'violet',
  'emerald',
  'amber',
  'rose',
  'slate',
  'teal',
])

export const fontFamilySchema = z.enum(['sans', 'serif', 'mono'])
export const fontSizeSchema = z.enum(['sm', 'md', 'lg'])
export const lineHeightSchema = z.enum(['tight', 'normal', 'relaxed'])
export const pageSizeSchema = z.enum(['a4', 'letter', 'legal'])
export const sectionIdSchema = z.enum([
  'summary',
  'experience',
  'education',
  'skills',
  'certifications',
  'languages',
  'projects',
  'custom',
])

// ── Section blocks ──────────────────────────────

export const personalInfoSchema = z.object({
  fullName: nonEmpty.min(2, 'Name must be at least 2 characters'),
  jobTitle: nonEmpty.min(2, 'Job title is required'),
  email: emailField,
  phone: optionalString,
  address: optionalString,
  city: optionalString,
  state: optionalString,
  postalCode: optionalString,
  country: optionalString,
  website: optionalUrl,
  linkedin: optionalUrl,
  github: optionalUrl,
  photo: optionalString,
})

export const experienceSchema = z.object({
  id: z.string().default(''),
  company: nonEmpty,
  position: nonEmpty,
  location: optionalString,
  startDate: dateField,
  endDate: dateField,
  current: z.boolean().default(false),
  description: z.array(z.string().trim()).default([]),
})

export const educationSchema = z.object({
  id: z.string().default(''),
  institution: nonEmpty,
  degree: nonEmpty,
  field: optionalString,
  location: optionalString,
  startDate: dateField,
  endDate: dateField,
  current: z.boolean().default(false),
  grade: optionalString,
  description: optionalString,
})

export const skillSchema = z.object({
  id: z.string().default(''),
  name: nonEmpty,
  level: skillLevelSchema.default('intermediate'),
  category: optionalString,
})

export const certificationSchema = z.object({
  id: z.string().default(''),
  name: nonEmpty,
  issuer: optionalString,
  issueDate: dateField,
  expiryDate: dateField,
  credentialId: optionalString,
  credentialUrl: optionalUrl,
})

export const languageSchema = z.object({
  id: z.string().default(''),
  name: nonEmpty,
  proficiency: languageProficiencySchema.default('intermediate'),
})

export const projectSchema = z.object({
  id: z.string().default(''),
  name: nonEmpty,
  description: optionalString,
  url: optionalUrl,
  technologies: z.array(z.string().trim()).default([]),
  startDate: dateField,
  endDate: dateField,
})

export const customSectionSchema = z.object({
  id: z.string().default(''),
  title: nonEmpty,
  items: z.array(z.string().trim()).default([]),
})

export const sectionConfigSchema = z.object({
  id: sectionIdSchema,
  visible: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
  title: optionalString,
})

export const pageMarginsSchema = z.object({
  top: z.number().min(0).max(50).default(16),
  right: z.number().min(0).max(50).default(16),
  bottom: z.number().min(0).max(50).default(16),
  left: z.number().min(0).max(50).default(16),
})

export const resumeStyleSchema = z.object({
  template: templateIdSchema.default('modern'),
  accentColor: accentColorSchema.default('indigo'),
  fontFamily: fontFamilySchema.default('sans'),
  fontSize: fontSizeSchema.default('md'),
  lineHeight: lineHeightSchema.default('normal'),
  pageSize: pageSizeSchema.default('a4'),
  margins: pageMarginsSchema.default({}),
})

// ── Root resume schema ──────────────────────────

export const resumeSchema = z.object({
  id: z.string().default(''),
  userId: z.string().default(''),
  title: nonEmpty.min(1, 'Resume title is required'),
  slug: optionalString,
  personalInfo: personalInfoSchema,
  summary: optionalString,
  experiences: z.array(experienceSchema).default([]),
  educations: z.array(educationSchema).default([]),
  skills: z.array(skillSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  languages: z.array(languageSchema).default([]),
  projects: z.array(projectSchema).default([]),
  customSections: z.array(customSectionSchema).default([]),
  sections: z.array(sectionConfigSchema).default([]),
  style: resumeStyleSchema.default({}),
  isPublic: z.boolean().default(false),
  isDraft: z.boolean().default(true),
  createdAt: z.string().default(''),
  updatedAt: z.string().default(''),
})

// ── Auth schemas ────────────────────────────────

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional().default(false),
})

export const registerSchema = z
  .object({
    email: emailField,
    username: nonEmpty.min(3, 'Username must be at least 3 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string(),
    firstName: optionalString,
    lastName: optionalString,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// ── Inferred types ──────────────────────────────

export type ResumeFormData = z.infer<typeof resumeSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>
export type ExperienceFormData = z.infer<typeof experienceSchema>
export type EducationFormData = z.infer<typeof educationSchema>
export type SkillFormData = z.infer<typeof skillSchema>
