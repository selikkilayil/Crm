'use client'

import { useState, useEffect } from 'react'
import * as Yup from 'yup'
import { FormWrapper, FormField, FormButton, FormErrorMessage } from '@/shared/components'
import { apiClient } from '@/shared/services'
import { ActivityFormData, activityTypes, Activity } from '../types'
import { ActivityType } from '@prisma/client'

interface ActivityFormProps {
  onSubmit: (data: ActivityFormData) => Promise<void>
  onClose: () => void
  initialData?: Partial<Activity>
  title?: string
  submitLabel?: string
}

const validationSchema = Yup.object({
  type: Yup.string().required('Activity type is required'),
  title: Yup.string().required('Title is required'),
  description: Yup.string(),
  scheduledAt: Yup.string(),
  leadId: Yup.string(),
  customerId: Yup.string(),
})

export default function ActivityForm({
  onSubmit,
  onClose,
  initialData = {},
  title = 'Add New Activity',
  submitLabel = 'Add Activity'
}: ActivityFormProps) {
  const [error, setError] = useState('')
  const [leads, setLeads] = useState([])
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    // Fetch leads and customers for linking
    Promise.all([
      apiClient.get('/api/leads').catch(() => []),
      apiClient.get('/api/customers').catch(() => [])
    ]).then(([leadsData, customersData]) => {
      setLeads(Array.isArray(leadsData) ? leadsData : [])
      setCustomers(Array.isArray(customersData) ? customersData : [])
    })
  }, [])

  const initialValues: ActivityFormData = {
    type: (initialData.type as ActivityType) || 'NOTE',
    title: initialData.title || '',
    description: initialData.description || '',
    scheduledAt: initialData.scheduledAt 
      ? new Date(initialData.scheduledAt).toISOString().slice(0, 16) 
      : '',
    leadId: initialData.lead?.id || '',
    customerId: initialData.customer?.id || '',
  }

  const handleSubmit = async (values: ActivityFormData, { setSubmitting }: any) => {
    try {
      setError('')
      await onSubmit(values)
    } catch (err: any) {
      setError(err.message || 'Failed to save activity')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">{title}</h2>
          
          <FormWrapper
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, setFieldValue }: any) => (
              <>
                <FormErrorMessage message={error} />
                
                <FormField
                  name="type"
                  label="Type"
                  as="select"
                  required
                >
                  {activityTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </FormField>
                
                <FormField
                  name="title"
                  label="Title"
                  required
                  placeholder="Brief description of the activity"
                />
                
                <FormField
                  name="description"
                  label="Description"
                  as="textarea"
                  rows={3}
                  placeholder="Detailed notes about the activity"
                />
                
                <FormField
                  name="scheduledAt"
                  label="Scheduled Date/Time"
                  type="datetime-local"
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    name="leadId"
                    label="Link to Lead"
                    as="select"
                    onChange={(e: any) => {
                      setFieldValue('leadId', e.target.value)
                      if (e.target.value) setFieldValue('customerId', '')
                    }}
                  >
                    <option value="">Select Lead</option>
                    {leads.map((lead: any) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name} {lead.company && `(${lead.company})`}
                      </option>
                    ))}
                  </FormField>
                  
                  <FormField
                    name="customerId"
                    label="Link to Customer"
                    as="select"
                    onChange={(e: any) => {
                      setFieldValue('customerId', e.target.value)
                      if (e.target.value) setFieldValue('leadId', '')
                    }}
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer: any) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} {customer.company && `(${customer.company})`}
                      </option>
                    ))}
                  </FormField>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <FormButton
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                  >
                    Cancel
                  </FormButton>
                  <FormButton
                    type="submit"
                    variant="primary"
                    loading={isSubmitting}
                  >
                    {submitLabel}
                  </FormButton>
                </div>
              </>
            )}
          </FormWrapper>
        </div>
      </div>
    </div>
  )
}