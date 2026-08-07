'use client'

import * as React from 'react'
import { useEditorStore } from '@/store/editor-store'
import type { Project } from '@/types'
import {
  AddButton,
  AreaField,
  EntryCard,
  TextField,
} from '@/components/editor/form-parts'

/**
 * ProjectsForm — personal / professional projects.
 * Technologies are stored as an array, edited as comma-separated text.
 */
export function ProjectsForm() {
  const projects = useEditorStore((s) => s.resume.projects)
  const addProject = useEditorStore((s) => s.addProject)
  const updateProject = useEditorStore((s) => s.updateProject)
  const removeProject = useEditorStore((s) => s.removeProject)

  return (
    <div className="space-y-4">
      {projects.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          No projects yet — showcase your side projects and open-source work.
        </p>
      ) : (
        projects.map((project, index) => (
          <EntryCard
            key={project.id}
            title={project.name}
            subtitle={project.url}
            index={index}
            total={projects.length}
            onRemove={() => removeProject(project.id)}
          >
            <ProjectEntry
              project={project}
              onChange={(patch) => updateProject(project.id, patch)}
            />
          </EntryCard>
        ))
      )}
      <AddButton label="Add Project" onClick={addProject} />
    </div>
  )
}

function ProjectEntry({
  project,
  onChange,
}: {
  project: Project
  onChange: (patch: Partial<Project>) => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Project Name"
          value={project.name}
          onChange={(v) => onChange({ name: v })}
          placeholder="e.g. Weather Dashboard"
        />
        <TextField
          label="URL"
          value={project.url}
          onChange={(v) => onChange({ url: v })}
          placeholder="https://… (optional)"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Start"
          type="month"
          value={project.startDate}
          onChange={(v) => onChange({ startDate: v })}
        />
        <TextField
          label="End"
          type="month"
          value={project.endDate}
          onChange={(v) => onChange({ endDate: v })}
        />
      </div>
      <AreaField
        label="Description"
        value={project.description}
        onChange={(v) => onChange({ description: v })}
        rows={3}
        placeholder="What does the project do? What was your role?"
      />
      <TextField
        label="Technologies"
        value={project.technologies.join(', ')}
        onChange={(v) =>
          onChange({
            technologies: v
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean),
          })
        }
        placeholder="React, TypeScript, Tailwind (comma separated)"
        hint="Separate technologies with commas."
      />
    </div>
  )
}
