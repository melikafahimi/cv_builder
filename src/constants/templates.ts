import type { TemplateMeta, TemplateId } from '@/types/resume'

/**
 * ───────────────────────────────────────────────
 * Resume template registry metadata
 * ───────────────────────────────────────────────
 * Mirrors the six templates from the legacy Flask app
 * (modern, classic, creative, professional, executive, safety).
 */
export const TEMPLATES: Record<TemplateId, TemplateMeta> = {
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Two-column layout with a bold sidebar.',
    twoColumn: true,
    thumbnail: '/templates/modern.svg',
    tags: ['two-column', 'sidebar', 'colorful'],
    premium: false,
  },
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Single-column traditional layout.',
    twoColumn: false,
    thumbnail: '/templates/classic.svg',
    tags: ['single-column', 'traditional', 'clean'],
    premium: false,
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'Colorful layout for design roles.',
    twoColumn: true,
    thumbnail: '/templates/creative.svg',
    tags: ['two-column', 'colorful', 'design'],
    premium: false,
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, ATS-friendly corporate layout.',
    twoColumn: false,
    thumbnail: '/templates/professional.svg',
    tags: ['single-column', 'ats', 'corporate'],
    premium: false,
  },
  executive: {
    id: 'executive',
    name: 'Executive',
    description: 'Bold header for senior leadership.',
    twoColumn: false,
    thumbnail: '/templates/executive.svg',
    tags: ['single-column', 'bold', 'leadership'],
    premium: true,
  },
  safety: {
    id: 'safety',
    name: 'Safety',
    description: 'Industrial / trade-focused layout.',
    twoColumn: true,
    thumbnail: '/templates/safety.svg',
    tags: ['two-column', 'industrial', 'trade'],
    premium: true,
  },
}

/** Ordered list of templates for the picker UI. */
export const TEMPLATE_LIST = Object.values(TEMPLATES)

/** Default template for new resumes. */
export const DEFAULT_TEMPLATE: TemplateId = 'modern'
