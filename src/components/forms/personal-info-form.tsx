'use client'

import * as React from 'react'
import { useEditorStore } from '@/store/editor-store'
import { TextField } from '@/components/editor/form-parts'

/**
 * PersonalInfoForm — edits the `personalInfo` block.
 * Controlled inputs bound directly to the editor store
 * so the live preview updates on every keystroke.
 */
export function PersonalInfoForm() {
  const personalInfo = useEditorStore((s) => s.resume.personalInfo)
  const updatePersonalInfo = useEditorStore((s) => s.updatePersonalInfo)

  const set = (key: keyof typeof personalInfo) => (value: string) =>
    updatePersonalInfo({ [key]: value })

  return (
    <div className="space-y-4">
      <TextField
        label="Full Name"
        value={personalInfo.fullName}
        onChange={set('fullName')}
        placeholder="e.g. Laura Müller"
      />
      <TextField
        label="Job Title"
        value={personalInfo.jobTitle}
        onChange={set('jobTitle')}
        placeholder="e.g. Retail Sales Associate"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Email"
          type="email"
          value={personalInfo.email}
          onChange={set('email')}
          placeholder="you@example.com"
        />
        <TextField
          label="Phone"
          value={personalInfo.phone}
          onChange={set('phone')}
          placeholder="+1 555 000 0000"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="City"
          value={personalInfo.city}
          onChange={set('city')}
          placeholder="City"
        />
        <TextField
          label="Country"
          value={personalInfo.country}
          onChange={set('country')}
          placeholder="Country"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Address"
          value={personalInfo.address}
          onChange={set('address')}
          placeholder="Street address"
        />
        <TextField
          label="Postal Code"
          value={personalInfo.postalCode}
          onChange={set('postalCode')}
          placeholder="Postal code"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="State / Region"
          value={personalInfo.state}
          onChange={set('state')}
          placeholder="State"
        />
        <TextField
          label="Photo URL"
          value={personalInfo.photo}
          onChange={set('photo')}
          placeholder="https://…"
        />
      </div>
      <TextField
        label="Website"
        value={personalInfo.website}
        onChange={set('website')}
        placeholder="https://your-site.com"
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="LinkedIn"
          value={personalInfo.linkedin}
          onChange={set('linkedin')}
          placeholder="https://linkedin.com/in/…"
        />
        <TextField
          label="GitHub"
          value={personalInfo.github}
          onChange={set('github')}
          placeholder="https://github.com/…"
        />
      </div>
    </div>
  )
}
