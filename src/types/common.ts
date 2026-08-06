import type { SectionId } from './resume'

/**
 * ───────────────────────────────────────────────
 * Common / Shared Types
 * ───────────────────────────────────────────────
 */

/** App theme mode managed by next-themes. */
export type ThemeMode = 'light' | 'dark' | 'system'

/** Editor zoom level for the resume canvas. */
export type ZoomLevel = 'fit' | '50' | '75' | '100' | '125' | '150'

/** Which panel is active on mobile editor views. */
export type EditorPanel = 'form' | 'preview' | 'design'

/** Toast notification variants. */
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

/** A toast message payload. */
export interface ToastMessage {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration?: number
}

/** Generic ID-based option for selects / dropdowns. */
export interface SelectOption<T = string> {
  label: string
  value: T
  disabled?: boolean
}

/** Result of a validation pass. */
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

/** Drag-and-drop item types for React DnD. */
export type DragType = 'section' | 'experience' | 'education' | 'skill'

/** A draggable item payload. */
export interface DragItem<T = unknown> {
  type: DragType
  id: string
  index: number
  data: T
}

/** Drop result returned after a DnD operation. */
export interface DropResult {
  sourceIndex: number
  targetIndex: number
  sectionId?: SectionId
}

/** Async status used by UI primitives. */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

/** A debounced value container. */
export interface DebouncedValue<T> {
  value: T
  isDebouncing: boolean
}

/** Navigation link descriptor. */
export interface NavLink {
  label: string
  href: string
  icon?: string
  external?: boolean
}