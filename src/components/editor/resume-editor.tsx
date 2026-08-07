'use client'

import * as React from 'react'
import { ResumeProvider } from '@/context/resume-provider'
import { useAutosave } from '@/hooks/use-autosave'
import { useUIStore } from '@/store/ui-store'
import { EditorToolbar } from './editor-toolbar'
import {
  EDITOR_SECTIONS,
  SectionNavigation,
  type EditorSectionId,
} from './section-navigation'
import { SectionForm } from './section-form'
import { ResumePreview } from '@/components/preview/resume-preview'
import { cn } from '@/lib/utils'

/**
 * ───────────────────────────────────────────────
 * ResumeEditor
 * ───────────────────────────────────────────────
 * The resume builder workspace:
 *
 *   ┌──────────────────────────────────────────────┐
 *   │ EditorToolbar (title, save status, sample)   │
 *   ├──────────┬────────────────┬──────────────────┤
 *   │ Sections │ Active section │  Live A4 preview │
 *   │ (rail)   │ form           │  + design tools  │
 *   └──────────┴────────────────┴──────────────────┘
 *
 * Desktop shows everything side by side; on mobile
 * the form and preview swap via the UI store panel.
 */

export function ResumeEditor() {
  const [activeSection, setActiveSection] =
    React.useState<EditorSectionId>('personal')
  const activePanel = useUIStore((s) => s.activePanel)

  useAutosave()

  return (
    <ResumeProvider>
      <div className="flex h-full min-h-0 flex-col">
        <EditorToolbar />

        <div className="flex min-h-0 flex-1">
          {/* Left: section rail + active form */}
          <div
            className={cn(
              'flex min-w-0 flex-1 border-r bg-background',
              activePanel === 'preview' && 'hidden lg:flex',
            )}
          >
            <aside className="hidden w-60 shrink-0 overflow-y-auto border-r bg-muted/30 md:block">
              <SectionNavigation
                activeSection={activeSection}
                onSelect={setActiveSection}
              />
            </aside>
            <div className="min-w-0 flex-1 overflow-y-auto">
              {/* Mobile section switcher */}
              <div className="flex gap-1 overflow-x-auto border-b bg-muted/30 px-3 py-2 md:hidden">
                {EDITOR_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                      activeSection === section.id
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground',
                    )}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
              <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
                <SectionForm activeSection={activeSection} />
              </div>
            </div>
          </div>

          {/* Right: live preview */}
          <div
            className={cn(
              'min-w-0 flex-1',
              activePanel === 'form' && 'hidden lg:block',
            )}
          >
            <ResumePreview />
          </div>
        </div>
      </div>
    </ResumeProvider>
  )
}
