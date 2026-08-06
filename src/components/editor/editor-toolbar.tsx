'use client'

import * as React from 'react'
import { useEditorStore } from '@/store/editor-store'
import { useExportPdf } from '@/hooks/use-export-pdf'
import { Button } from '@/components/ui/button'

/**
 * Editor toolbar — save status, export, print, undo/redo.
 * Architecture placeholder; wired to store + hooks.
 */
export function EditorToolbar() {
  const saveStatus = useEditorStore((s) => s.saveStatus)
  const { exportPdf, print } = useExportPdf()

  return (
    <div className="flex items-center justify-between border-b px-4 py-2">
      <span className="text-sm text-muted-foreground">
        {saveStatus === 'saving'
          ? 'Saving…'
          : saveStatus === 'saved'
            ? 'All changes saved'
            : saveStatus === 'error'
              ? 'Save failed'
              : 'Idle'}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={print}>
          Print
        </Button>
        <Button size="sm" onClick={exportPdf}>
          Export PDF
        </Button>
      </div>
    </div>
  )
}