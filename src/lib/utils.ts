import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * `cn` merges Tailwind class names intelligently,
 * resolving conflicts (later classes win) and handling
 * conditional class objects/arrays.
 *
 * Used by every shadcn/ui component and across the app.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
