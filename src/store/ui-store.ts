import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { ZoomLevel, EditorPanel, ThemeMode } from '@/types'
import { STORAGE_KEYS } from '@/constants'

/**
 * ───────────────────────────────────────────────
 * UI Store (Zustand)
 * ───────────────────────────────────────────────
 * Manages ephemeral UI state: editor zoom, active
 * panel on mobile, sidebar collapse, and theme.
 */

interface UIState {
  zoom: ZoomLevel
  activePanel: EditorPanel
  sidebarCollapsed: boolean
  theme: ThemeMode
  isPreviewLoading: boolean

  setZoom: (zoom: ZoomLevel) => void
  setActivePanel: (panel: EditorPanel) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setTheme: (theme: ThemeMode) => void
  setPreviewLoading: (loading: boolean) => void
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        zoom: 'fit',
        activePanel: 'form',
        sidebarCollapsed: false,
        theme: 'system',
        isPreviewLoading: false,

        setZoom: (zoom) => set({ zoom }, false, 'setZoom'),

        setActivePanel: (activePanel) =>
          set({ activePanel }, false, 'setActivePanel'),

        toggleSidebar: () =>
          set(
            (s) => ({ sidebarCollapsed: !s.sidebarCollapsed }),
            false,
            'toggleSidebar',
          ),

        setSidebarCollapsed: (sidebarCollapsed) =>
          set({ sidebarCollapsed }, false, 'setSidebarCollapsed'),

        setTheme: (theme) => set({ theme }, false, 'setTheme'),

        setPreviewLoading: (isPreviewLoading) =>
          set({ isPreviewLoading }, false, 'setPreviewLoading'),
      }),
      {
        name: STORAGE_KEYS.THEME,
        partialize: (state) => ({ theme: state.theme }),
      },
    ),
    { name: 'UIStore' },
  ),
)
