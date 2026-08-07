'use client'

import * as React from 'react'
import { useEditorStore } from '@/store/editor-store'
import type { Certification } from '@/types'
import { AddButton, EntryCard, TextField } from '@/components/editor/form-parts'

/**
 * CertificationsForm — professional certifications.
 */
export function CertificationsForm() {
  const certifications = useEditorStore((s) => s.resume.certifications)
  const addCertification = useEditorStore((s) => s.addCertification)
  const updateCertification = useEditorStore((s) => s.updateCertification)
  const removeCertification = useEditorStore((s) => s.removeCertification)

  return (
    <div className="space-y-4">
      {certifications.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          No certifications yet — add licenses and certificates here.
        </p>
      ) : (
        certifications.map((cert, index) => (
          <EntryCard
            key={cert.id}
            title={cert.name}
            subtitle={cert.issuer}
            index={index}
            total={certifications.length}
            onRemove={() => removeCertification(cert.id)}
          >
            <CertificationEntry
              cert={cert}
              onChange={(patch) => updateCertification(cert.id, patch)}
            />
          </EntryCard>
        ))
      )}
      <AddButton label="Add Certification" onClick={addCertification} />
    </div>
  )
}

function CertificationEntry({
  cert,
  onChange,
}: {
  cert: Certification
  onChange: (patch: Partial<Certification>) => void
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Certification"
          value={cert.name}
          onChange={(v) => onChange({ name: v })}
          placeholder="e.g. AWS Certified Solutions Architect"
        />
        <TextField
          label="Issuer"
          value={cert.issuer}
          onChange={(v) => onChange({ issuer: v })}
          placeholder="e.g. Amazon Web Services"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Issue Date"
          type="month"
          value={cert.issueDate}
          onChange={(v) => onChange({ issueDate: v })}
        />
        <TextField
          label="Expiry Date"
          type="month"
          value={cert.expiryDate}
          onChange={(v) => onChange({ expiryDate: v })}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Credential ID"
          value={cert.credentialId}
          onChange={(v) => onChange({ credentialId: v })}
          placeholder="Optional"
        />
        <TextField
          label="Credential URL"
          value={cert.credentialUrl}
          onChange={(v) => onChange({ credentialUrl: v })}
          placeholder="https://… (optional)"
        />
      </div>
    </div>
  )
}
