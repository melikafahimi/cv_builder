import type { NavLink } from '@/types/common'

/**
 * ───────────────────────────────────────────────
 * Navigation constants
 * ───────────────────────────────────────────────
 */

/** Primary marketing / public site nav. */
export const PUBLIC_NAV: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Templates', href: '/templates' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
]

/** Authenticated app nav (sidebar). */
export const APP_NAV: NavLink[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'My Resumes', href: '/dashboard/resumes', icon: 'FileText' },
  { label: 'Templates', href: '/dashboard/templates', icon: 'Palette' },
  { label: 'Settings', href: '/dashboard/settings', icon: 'Settings' },
]

/** Footer links. */
export const FOOTER_NAV: NavLink[] = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Contact', href: '/contact' },
]