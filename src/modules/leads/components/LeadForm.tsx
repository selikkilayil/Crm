'use client'

import { useState } from 'react'
import * as Yup from 'yup'
import { FormWrapper, FormField, FormButton, FormErrorMessage } from '@/shared/components'
import type { LeadFormData, LeadStatus } from '../types'

interface LeadFormProps {
  initialValues?: Partial<LeadFormData>
  onSubmit: (data: LeadFormData) => Promise<void> | void
  onClose?: () => void
  users?: Array<{ id: string; name: string; role: string }>
  submitLabel?: string
  title?: string
}

const leadStatuses: Array<{ value: LeadStatus; label: string }> = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'LOST', label: 'Lost' }
]

const leadSources = [
  'Website',
  'Referral', 
  'Social Media',
  'Email Campaign',
  'Cold Call',
  'Trade Show',
  'Advertisement',
  'Other'
]

export function LeadForm({ 
  initialValues = {}, 
  onSubmit, 
  onClose,
  users = [],
  submitLabel = 'Save Lead',
  title = 'Lead Information'
}: LeadFormProps) {
  const [error, setError] = useState('')

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string().nullable(),
    company: Yup.string().nullable(),
    status: Yup.string().required('Status is required'),
    source: Yup.string().nullable(),
    value: Yup.string().nullable(),
    notes: Yup.string().nullable(),
    assignedToId: Yup.string().nullable(),
  })

  const defaultValues: LeadFormData = {
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'NEW',
    source: '',
    value: '',
    notes: '',
    assignedToId: '',
    ...initialValues
  }

  const handleSubmit = async (values: LeadFormData, { setSubmitting }: any) => {
    try {
      setError('')
      await onSubmit(values)
    } catch (err: any) {
      setError(err.message || 'Failed to save lead')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {title && (
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      )}
      
      <FormWrapper
        initialValues={defaultValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }: any) => (
          <>
            <FormErrorMessage message={error} />
            
            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormField name="name" label="Name" required />
              </div>
              
              <FormField name="email" label="Email" type="email" required />
              <FormField name="phone" label="Phone" type="tel" />
              <FormField name="company" label="Company" />
              
              <FormField name="status" label="Status" as="select" required>
                {leadStatuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </FormField>
            </div>
            
            {/* Additional Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField name="source" label="Lead Source" as="select">
                <option value="">Select Source</option>
                {leadSources.map(source => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </FormField>
              
              <FormField name="value" label="Potential Value" type="number" placeholder="0.00" />
              
              {users.length > 0 && (
                <div className="sm:col-span-2">
                  <FormField name="assignedToId" label="Assign To" as="select">
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </FormField>
                </div>
              )}
            </div>
            
            <FormField name="notes" label="Notes" as="textarea" rows={3} />
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              {onClose && (
                <FormButton type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </FormButton>
              )}
              <FormButton type="submit" variant="primary" loading={isSubmitting}>
                {submitLabel}
              </FormButton>
            </div>
          </>
        )}
      </FormWrapper>
    </div>
  )
}