'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { personalInfoSchema, type PersonalInfoFormData } from '@/schemas/resume-schema'
import { useEditorStore } from '@/store/editor-store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

/**
 * PersonalInfoForm — edits the `personalInfo` block.
 * Uses React Hook Form + Zod resolver, then pushes
 * validated values into the Zustand editor store on
 * every change for live preview.
 */
export function PersonalInfoForm() {
  const personalInfo = useEditorStore((s) => s.resume.personalInfo)
  const updatePersonalInfo = useEditorStore((s) => s.updatePersonalInfo)

  const { register, handleSubmit } = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: personalInfo,
    mode: 'onChange',
  })

  // Live-update the store on every field change.
  const onChange = handleSubmit((data) => {
    updatePersonalInfo(data)
  })

  return (
    <form onChange={onChange} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input id="fullName" {...register('fullName')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="jobTitle">Job Title</Label>
        <Input id="jobTitle" {...register('jobTitle')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" {...register('phone')} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register('city')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" {...register('country')} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input id="website" {...register('website')} />
      </div>
    </form>
  )
}