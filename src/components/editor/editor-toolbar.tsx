'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowLeftRight, FileText, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useEditorStore } from '@/store/editor-store'
import { useUIStore } from '@/store/ui-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/**
 * EditorToolbar — the top bar of the resume builder:
 * back navigation, editable resume title, autosave
 * status, sample-data loader and mobile panel switcher.
 */
export function EditorToolbar() {
  const resume = useEditorStore((s) => s.resume)
  const setTitle = useEditorStore((s) => s.setTitle)
  const saveStatus = useEditorStore((s) => s.saveStatus)
  const isDirty = useEditorStore((s) => s.isDirty)
  const loadSample = useEditorStore((s) => s.loadSample)

  const activePanel = useUIStore((s) => s.activePanel)
  const setActivePanel = useUIStore((s) => s.setActivePanel)

  const handleLoadSample = () => {
    loadSample()
    toast.success('Sample resume loaded', {
      description: 'Edit the fields to make it yours.',
    })
  }

  return (
    <div className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-3 md:px-4">
      <Button
        variant="ghost"
        size="icon"
        asChild
        aria-label="Back to dashboard"
      >
        <Link href="/dashboard">
          <ArrowLeft className="size-4" />
        </Link>
      </Button>

      <Input
        value={resume.title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Resume title"
        aria-label="Resume title"
        className="h-9 w-40 border-transparent bg-transparent px-2 font-semibold focus-visible:border-input focus-visible:bg-background sm:w-56"
      />

      <SaveStatusBadge status={saveStatus} isDirty={isDirty} />

      <div className="flex-1" />

      {/* Mobile panel switcher */}
      <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-0.5 lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 px-2.5 text-xs',
            activePanel === 'form' && 'bg-background shadow-sm',
          )}
          onClick={() => setActivePanel('form')}
        >
          <ArrowLeftRight className="size-3.5" />
          Form
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 px-2.5 text-xs',
            activePanel === 'preview' && 'bg-background shadow-sm',
          )}
          onClick={() => setActivePanel('preview')}
        >
          <FileText className="size-3.5" />
          Preview
        </Button>
      </div>

      <Button variant="outline" size="sm" onClick={handleLoadSample}>
        <Sparkles className="size-4 text-primary" />
        <span className="hidden sm:inline">Load sample</span>
      </Button>
    </div>
  )
}

function SaveStatusBadge({
  status,
  isDirty,
}: {
  status: 'idle' | 'saving' | 'saved' | 'error'
  isDirty: boolean
}) {
  const label =
    status === 'saving'
      ? 'Saving…'
      : status === 'saved'
        ? 'All changes saved'
        : status === 'error'
          ? 'Save failed'
          : isDirty
            ? 'Unsaved changes'
            : 'Ready'

  return (
    <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:inline-flex">
      <span
        className={cn(
          'size-2 rounded-full',
          status === 'saving' && 'animate-pulse bg-amber-500',
          status === 'saved' && 'bg-emerald-500',
          status === 'error' && 'bg-destructive',
          status === 'idle' &&
            (isDirty ? 'bg-muted-foreground/50' : 'bg-emerald-500'),
        )}
      />
      {label}
    </span>
  )
}
