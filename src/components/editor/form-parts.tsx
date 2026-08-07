'use client'

import * as React from 'react'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

/**
 * ───────────────────────────────────────────────
 * Shared form primitives for the editor pane.
 * Controlled inputs bound directly to the editor
 * store so the live preview updates on every keystroke.
 * ───────────────────────────────────────────────
 */

interface FieldProps {
  label: string
  hint?: string
  className?: string
  children: React.ReactNode
}

export function Field({ label, hint, className, children }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
      {hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
  hint?: string
  className?: string
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled,
  hint,
  className,
}: TextFieldProps) {
  return (
    <Field label={label} hint={hint} className={className}>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  )
}

interface AreaFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  hint?: string
  className?: string
}

export function AreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  hint,
  className,
}: AreaFieldProps) {
  return (
    <Field label={label} hint={hint} className={className}>
      <Textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  )
}

interface SelectFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: { label: string; value: string }[]
  placeholder?: string
  className?: string
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  className,
}: SelectFieldProps) {
  return (
    <Field label={label} className={className}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

interface CheckFieldProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export function CheckField({
  label,
  checked,
  onChange,
  className,
}: CheckFieldProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-2 text-sm font-medium',
        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-input accent-[hsl(var(--primary))]"
      />
      {label}
    </label>
  )
}

interface EntryCardProps {
  title: string
  subtitle?: string
  index: number
  total: number
  onRemove: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  children: React.ReactNode
}

/** A card wrapper for a single list entry (experience, education, …). */
export function EntryCard({
  title,
  subtitle,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
  children,
}: EntryCardProps) {
  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <div className="flex items-center gap-1 border-b bg-muted/40 px-3 py-2">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {title || 'Untitled'}
          </p>
          {subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-0.5">
          {onMoveUp ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={index === 0}
              onClick={onMoveUp}
              aria-label="Move up"
            >
              <ChevronUp className="size-3.5" />
            </Button>
          ) : null}
          {onMoveDown ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={index === total - 1}
              onClick={onMoveDown}
              aria-label="Move down"
            >
              <ChevronDown className="size-3.5" />
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            onClick={onRemove}
            aria-label="Remove entry"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
      <div className="space-y-3 p-4">{children}</div>
    </div>
  )
}

interface AddButtonProps {
  label: string
  onClick: () => void
}

export function AddButton({ label, onClick }: AddButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full border-dashed text-muted-foreground hover:text-foreground"
      onClick={onClick}
    >
      <Plus className="size-4" />
      {label}
    </Button>
  )
}
