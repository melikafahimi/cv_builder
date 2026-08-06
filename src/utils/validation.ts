import { resumeSchema } from '@/schemas/resume-schema'
import type { Resume, ValidationResult } from '@/types'

/**
 * ───────────────────────────────────────────────
 * Validation utilities
 * ───────────────────────────────────────────────
 */

/** Validate a full resume object against the Zod schema. */
export function validateResume(resume: Resume): ValidationResult {
  const result = resumeSchema.safeParse(resume)
  if (result.success) {
    return { isValid: true, errors: {} }
  }
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const path = issue.path.join('.')
    if (!errors[path]) {
      errors[path] = issue.message
    }
  }
  return { isValid: false, errors }
}

/** Validate a single field path against the resume schema. */
export function validateField(
  resume: Resume,
  path: string,
): string | undefined {
  const result = resumeSchema.safeParse(resume)
  if (result.success) return undefined
  const issue = result.error.issues.find(
    (i) => i.path.join('.') === path,
  )
  return issue?.message
}

/** Check whether an email is valid. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/** Check whether a URL is valid. */
export function isValidUrl(url: string): boolean {
  if (!url) return true
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/** Check whether a phone number looks plausible. */
export function isValidPhone(phone: string): boolean {
  if (!phone) return true
  return /^[+\d\s()-]{7,20}$/.test(phone)
}