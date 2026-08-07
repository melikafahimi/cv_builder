import type {
  Resume,
  SectionConfig,
  SectionId,
  SkillLevel,
  LanguageProficiency,
  AccentColor,
  SelectOption,
  ThemeMode,
  ZoomLevel,
} from '@/types'
import { DEFAULT_TEMPLATE } from './templates'

/**
 * ───────────────────────────────────────────────
 * Resume domain constants
 * ───────────────────────────────────────────────
 */

/** Default section ordering and visibility. */
export const DEFAULT_SECTIONS: SectionConfig[] = [
  { id: 'summary', visible: true, order: 0, title: 'Summary' },
  { id: 'experience', visible: true, order: 1, title: 'Experience' },
  { id: 'education', visible: true, order: 2, title: 'Education' },
  { id: 'skills', visible: true, order: 3, title: 'Skills' },
  { id: 'certifications', visible: false, order: 4, title: 'Certifications' },
  { id: 'languages', visible: false, order: 5, title: 'Languages' },
  { id: 'projects', visible: false, order: 6, title: 'Projects' },
  { id: 'custom', visible: false, order: 7, title: 'Custom' },
]

/** Human-readable labels for each section. */
export const SECTION_LABELS: Record<SectionId, string> = {
  summary: 'Summary',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  certifications: 'Certifications',
  languages: 'Languages',
  projects: 'Projects',
  custom: 'Custom Section',
}

/** Skill level options for selects. */
export const SKILL_LEVEL_OPTIONS: SelectOption<SkillLevel>[] = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
  { label: 'Expert', value: 'expert' },
]

/** Language proficiency options for selects. */
export const LANGUAGE_PROFICIENCY_OPTIONS: SelectOption<LanguageProficiency>[] =
  [
    { label: 'Beginner', value: 'beginner' },
    { label: 'Elementary', value: 'elementary' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
    { label: 'Fluent', value: 'fluent' },
    { label: 'Native', value: 'native' },
  ]

/** Accent color options for the design panel. */
export const ACCENT_COLOR_OPTIONS: SelectOption<AccentColor>[] = [
  { label: 'Blue', value: 'blue' },
  { label: 'Indigo', value: 'indigo' },
  { label: 'Violet', value: 'violet' },
  { label: 'Emerald', value: 'emerald' },
  { label: 'Amber', value: 'amber' },
  { label: 'Rose', value: 'rose' },
  { label: 'Slate', value: 'slate' },
  { label: 'Teal', value: 'teal' },
]

/** Theme mode options. */
export const THEME_OPTIONS: SelectOption<ThemeMode>[] = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
]

/** Editor zoom options. */
export const ZOOM_OPTIONS: SelectOption<ZoomLevel>[] = [
  { label: 'Fit', value: 'fit' },
  { label: '50%', value: '50' },
  { label: '75%', value: '75' },
  { label: '100%', value: '100' },
  { label: '125%', value: '125' },
  { label: '150%', value: '150' },
]

/** Accent color → Tailwind class map for resume rendering. */
export const ACCENT_COLOR_CLASSES: Record<AccentColor, string> = {
  blue: 'text-blue-600',
  indigo: 'text-indigo-600',
  violet: 'text-violet-600',
  emerald: 'text-emerald-600',
  amber: 'text-amber-600',
  rose: 'text-rose-600',
  slate: 'text-slate-700',
  teal: 'text-teal-600',
}

/** Accent color → hex map for PDF export. */
export const ACCENT_COLOR_HEX: Record<AccentColor, string> = {
  blue: '#2563eb',
  indigo: '#4f46e5',
  violet: '#7c3aed',
  emerald: '#059669',
  amber: '#d97706',
  rose: '#e11d48',
  slate: '#334155',
  teal: '#0d9488',
}

/**
 * A factory that returns a fresh empty resume.
 * Used when the user clicks "Create new resume".
 */
export function createEmptyResume(): Resume {
  const now = new Date().toISOString()
  return {
    id: '',
    userId: '',
    title: 'Untitled Resume',
    slug: '',
    personalInfo: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      website: '',
      linkedin: '',
      github: '',
      photo: '',
    },
    summary: '',
    experiences: [],
    educations: [],
    skills: [],
    certifications: [],
    languages: [],
    projects: [],
    customSections: [],
    sections: DEFAULT_SECTIONS,
    style: {
      template: DEFAULT_TEMPLATE,
      accentColor: 'indigo',
      fontFamily: 'sans',
      fontSize: 'md',
      lineHeight: 'normal',
      pageSize: 'a4',
      margins: { top: 16, right: 16, bottom: 16, left: 16 },
    },
    isPublic: false,
    isDraft: true,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Sample resume populated with realistic data — used for
 * the demo / "try it" experience and as a starting template.
 */
export function createSampleResume(): Resume {
  const base = createEmptyResume()
  return {
    ...base,
    title: 'Sample Resume',
    personalInfo: {
      ...base.personalInfo,
      fullName: 'Laura Müller',
      jobTitle: 'Retail Sales Associate',
      email: 'l.muller@sample.ch',
      phone: '+41 (077) 444 55 55',
      city: 'Lausanne',
      country: 'Switzerland',
    },
    summary:
      'Customer and Retail Sales professional with solid understanding of retail dynamics, marketing and customer service. Offering 5 years of experience providing quality product recommendations and solutions to meet customer needs and exceed expectations.',
    skills: [
      {
        id: 's1',
        name: 'Inventory management',
        level: 'advanced',
        category: '',
      },
      {
        id: 's2',
        name: 'Accurate money handling',
        level: 'advanced',
        category: '',
      },
      {
        id: 's3',
        name: 'Documentation and record keeping',
        level: 'intermediate',
        category: '',
      },
      {
        id: 's4',
        name: 'Retail merchandising expertise',
        level: 'expert',
        category: '',
      },
    ],
    experiences: [
      {
        id: 'e1',
        company: 'Retail Co.',
        position: 'Retail Sales Associate',
        location: 'Lausanne, Switzerland',
        startDate: '2017-02',
        endDate: '',
        current: true,
        description: [
          'Increased monthly sales 10% by effectively upselling and cross-selling products to maximize profitability.',
          'Proven ability to increase sales by leveraging cross-functional expertise.',
          'Processed payments and maintained accurate records to meet financial targets.',
        ],
      },
      {
        id: 'e2',
        company: 'Shop Inc.',
        position: 'Retail Sales Associate',
        location: 'Lausanne, Switzerland',
        startDate: '2015-08',
        endDate: '2017-01',
        current: false,
        description: [
          'Upsold seasonal items and products, boosting average store sales by 1%.',
          'Managed inventory and maintained accurate records to meet financial targets.',
          'Trained new staff on 5 business areas to ensure smooth operation.',
          'Developed creative and appealing store art techniques.',
        ],
      },
    ],
    educations: [
      {
        id: 'ed1',
        institution: 'Ecole des métiers',
        degree: 'Federal VET Diploma',
        field: 'Retail Business Management',
        location: 'Lausanne, Switzerland',
        startDate: '2014',
        endDate: '2018',
        current: false,
        grade: '',
        description: 'Sales apprenticeship',
      },
    ],
  }
}
