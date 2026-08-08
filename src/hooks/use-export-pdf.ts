'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { useEditorStore } from '@/store/editor-store'
import {
  exportElementToPdf,
  buildExportOptions,
  printElement,
  downloadJson,
} from '@/utils/export'

/**
 * ───────────────────────────────────────────────
 * useExportPdf
 * ───────────────────────────────────────────────
 * Provides handlers for exporting the resume preview
 * element to PDF, printing, and downloading JSON.
 * The caller passes a ref to the printable DOM node.
 */
export function useExportPdf() {
  const elementRef = React.useRef<HTMLElement | null>(null)
  const [isExporting, setIsExporting] = React.useState(false)
  const resume = useEditorStore((s) => s.resume)

  const exportPdf = React.useCallback(async () => {
    const element = elementRef.current
    if (!element) {
      toast.error('Nothing to export', {
        description: 'The resume preview is not ready yet.',
      })
      return
    }
    setIsExporting(true)
    try {
      await exportElementToPdf(element, buildExportOptions(resume))
      toast.success('PDF exported', {
        description: 'Your resume has been downloaded.',
      })
    } catch (error) {
      toast.error('Export failed', {
        description:
          error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsExporting(false)
    }
  }, [resume])

  const print = React.useCallback(() => {
    const element = elementRef.current
    if (!element) return
    printElement(element)
  }, [])

  const exportJson = React.useCallback(() => {
    downloadJson(resume)
    toast.success('JSON downloaded')
  }, [resume])

  return {
    elementRef,
    isExporting,
    exportPdf,
    print,
    exportJson,
  }
}