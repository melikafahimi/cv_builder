'use client'

import * as React from 'react'
import { Download, Loader2, Printer, ZoomIn, ZoomOut } from 'lucide-react'
import { useEditorStore } from '@/store/editor-store'
import { useUIStore } from '@/store/ui-store'
import { useExportPdf } from '@/hooks/use-export-pdf'
import {
  ACCENT_COLOR_HEX,
  ACCENT_COLOR_OPTIONS,
  TEMPLATE_LIST,
} from '@/constants'
import type { AccentColor, Resume, TemplateId } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ResumeDocument } from './resume-document'

/**
 * ───────────────────────────────────────────────
 * ResumePreview
 * ───────────────────────────────────────────────
 * The right pane of the builder: an A4 "paper"
 * rendered from the editor store at a configurable
 * zoom, plus the design controls (template, accent
 * color, typography) and PDF / print export.
 * ───────────────────────────────────────────────
 */

/** A4 dimensions in px at 96 DPI. */
const PAPER_W = 794
const PAPER_H = 1123

const ZOOM_STEPS = ['fit', '50', '75', '100', '125', '150'] as const

export function ResumePreview() {
  const resume = useEditorStore((s) => s.resume)
  const setTemplate = useEditorStore((s) => s.setTemplate)
  const setAccentColor = useEditorStore((s) => s.setAccentColor)
  const setStyle = useEditorStore((s) => s.setStyle)

  const zoom = useUIStore((s) => s.zoom)
  const setZoom = useUIStore((s) => s.setZoom)

  const { elementRef, isExporting, exportPdf, print } = useExportPdf()

  const containerRef = React.useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = React.useState(0)

  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0
      setContainerWidth(width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const fitScale =
    containerWidth > 0
      ? Math.min(Math.max((containerWidth - 64) / PAPER_W, 0.2), 1)
      : 1
  const scale = zoom === 'fit' ? fitScale : Number(zoom) / 100

  /** Temporarily unscale the paper while html2pdf captures it. */
  const handleExport = async () => {
    const paper = elementRef.current
    const container = containerRef.current
    const prevTransform = paper?.style.transform
    const prevOverflow = container?.style.overflow
    // html2canvas renders ancestor transforms, so remove the
    // zoom scale from the paper itself before capturing.
    if (paper) paper.style.transform = 'none'
    if (container) container.style.overflow = 'visible'
    await new Promise((resolve) => setTimeout(resolve, 60))
    try {
      await exportPdf()
    } finally {
      if (paper) {
        if (prevTransform) paper.style.transform = prevTransform
        else paper.style.removeProperty('transform')
      }
      if (container) {
        if (prevOverflow) container.style.overflow = prevOverflow
        else container.style.removeProperty('overflow')
      }
    }
  }

  const zoomIndex = ZOOM_STEPS.indexOf(zoom)
  const stepZoom = (dir: 1 | -1) => {
    const next =
      ZOOM_STEPS[Math.min(Math.max(zoomIndex + dir, 0), ZOOM_STEPS.length - 1)]
    if (next) setZoom(next)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Design + export bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b bg-background px-4 py-2.5">
        <DesignSelect
          label="Template"
          value={resume.style.template}
          onChange={(v) => setTemplate(v as TemplateId)}
          options={TEMPLATE_LIST.map((t) => ({ label: t.name, value: t.id }))}
        />

        <div className="flex items-center gap-1.5">
          <span className="mr-0.5 text-xs font-medium text-muted-foreground">
            Accent
          </span>
          {ACCENT_COLOR_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              title={option.label}
              aria-label={`Accent color ${option.label}`}
              onClick={() => setAccentColor(option.value as AccentColor)}
              className={cn(
                'size-5 rounded-full transition-transform hover:scale-110',
                resume.style.accentColor === option.value &&
                  'ring-2 ring-ring ring-offset-2',
              )}
              style={{
                background: ACCENT_COLOR_HEX[option.value as AccentColor],
              }}
            />
          ))}
        </div>

        <DesignSelect
          label="Font"
          value={resume.style.fontFamily}
          onChange={(v) =>
            setStyle({ fontFamily: v as Resume['style']['fontFamily'] })
          }
          options={[
            { label: 'Sans', value: 'sans' },
            { label: 'Serif', value: 'serif' },
            { label: 'Mono', value: 'mono' },
          ]}
        />

        <DesignSelect
          label="Size"
          value={resume.style.fontSize}
          onChange={(v) =>
            setStyle({ fontSize: v as Resume['style']['fontSize'] })
          }
          options={[
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' },
          ]}
        />

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => stepZoom(-1)}
            disabled={zoomIndex <= 0}
            aria-label="Zoom out"
          >
            <ZoomOut className="size-4" />
          </Button>
          <select
            value={zoom}
            onChange={(e) => setZoom(e.target.value as typeof zoom)}
            aria-label="Zoom level"
            className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {ZOOM_STEPS.map((step) => (
              <option key={step} value={step}>
                {step === 'fit' ? 'Fit' : `${step}%`}
              </option>
            ))}
          </select>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => stepZoom(1)}
            disabled={zoomIndex >= ZOOM_STEPS.length - 1}
            aria-label="Zoom in"
          >
            <ZoomIn className="size-4" />
          </Button>

          <span className="mx-1 h-5 w-px bg-border" />

          <Button variant="outline" size="sm" onClick={print}>
            <Printer className="size-4" />
            <span className="hidden xl:inline">Print</span>
          </Button>
          <Button size="sm" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            <span className="hidden xl:inline">Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-muted/40 [background-image:radial-gradient(hsl(var(--border))_1px,transparent_1px)] [background-size:16px_16px]"
      >
        <div
          style={{
            width: PAPER_W * scale,
            height: PAPER_H * scale,
            margin: '32px auto',
          }}
        >
          <div
            ref={(el) => {
              elementRef.current = el
            }}
            className="resume-surface"
            style={{
              width: PAPER_W,
              height: PAPER_H,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              overflow: 'hidden',
              boxShadow:
                '0 1px 2px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.12)',
              borderRadius: 2,
            }}
          >
            <ResumeDocument resume={resume} />
          </div>
        </div>
      </div>
    </div>
  )
}

function DesignSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
}) {
  return (
    <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
