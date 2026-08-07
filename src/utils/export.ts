import type { Resume, PageSize } from '@/types'
import { PAGE_DIMENSIONS } from '@/constants/config'

/**
 * ───────────────────────────────────────────────
 * PDF / Print export utilities
 * ───────────────────────────────────────────────
 * Wraps `html2pdf.js` and `react-to-print` with a
 * consistent configuration derived from the resume style.
 */

export interface ExportOptions {
  filename: string
  pageSize: PageSize
  margins: { top: number; right: number; bottom: number; left: number }
  /** Whether to render in dark mode (usually false for resumes). */
  dark?: boolean
}

/** Build a default export options object from a resume. */
export function buildExportOptions(resume: Resume): ExportOptions {
  return {
    filename: `${resume.title || 'resume'}.pdf`
      .replace(/\s+/g, '-')
      .toLowerCase(),
    pageSize: resume.style.pageSize,
    margins: resume.style.margins,
    dark: false,
  }
}

/** Get pixel dimensions for a page size (at 96 DPI). */
export function getPageSizePixels(pageSize: PageSize): {
  width: number
  height: number
} {
  const mm = PAGE_DIMENSIONS[pageSize]
  // 1mm ≈ 3.7795px at 96 DPI
  const pxPerMm = 3.7795
  return {
    width: Math.round(mm.width * pxPerMm),
    height: Math.round(mm.height * pxPerMm),
  }
}

/**
 * Export a DOM element to PDF using html2pdf.js.
 * Dynamically imported so the library only loads client-side.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: ExportOptions,
): Promise<void> {
  const html2pdf = (await import('html2pdf.js')).default
  const { width, height } = getPageSizePixels(options.pageSize)

  await html2pdf()
    .set({
      margin: [
        options.margins.top,
        options.margins.right,
        options.margins.bottom,
        options.margins.left,
      ],
      filename: options.filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: {
        unit: 'mm',
        format: options.pageSize,
        orientation: width > height ? 'landscape' : 'portrait',
      },
    })
    .from(element)
    .save()
}

/** Trigger the browser's native print dialog for an element. */
export function printElement(element: HTMLElement): void {
  const printWindow = window.open('', '_blank', 'noopener,noreferrer')
  if (!printWindow) return
  printWindow.document.write(`
    <html>
      <head>
        <title>Resume</title>
      </head>
      <body>${element.outerHTML}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()
}

/** Download a JSON backup of the resume. */
export function downloadJson(resume: Resume): void {
  const blob = new Blob([JSON.stringify(resume, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${resume.title || 'resume'}.json`
  a.click()
  URL.revokeObjectURL(url)
}
