'use client'

import { useState, useEffect } from 'react'
import * as Yup from 'yup'
import { FormWrapper, FormField, FormButton, FormErrorMessage } from '@/shared/components'
import { apiClient } from '@/shared/services'
import { Task, taskStatuses, taskPriorities, CreateTaskRequest } from '../types'
import { TaskStatus, TaskPriority } from '@prisma/client'

interface TaskFormProps {
  onSubmit: (data: CreateTaskRequest) => Promise<void>
  onClose: () => void
  initialData?: Partial<Task>
  title?: string
  submitLabel?: string
}

const validationSchema = Yup.object({
  title: Yup.string().required('Title is required'),
  description: Yup.string().nullable(),
  status: Yup.string().required('Status is required'),
  priority: Yup.string().required('Priority is required'),
  dueDate: Yup.string().nullable(),
  assignedToId: Yup.string().nullable(),
  leadId: Yup.string().nullable(),
  customerId: Yup.string().nullable(),
})

export default function TaskForm({
  onSubmit,
  onClose,
  initialData = {},
  title = 'Create New Task',
  submitLabel = 'Create Task'
}: TaskFormProps) {
  const [error, setError] = useState('')
  const [leads, setLeads] = useState([])
  const [customers, setCustomers] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    // Fetch leads, customers, and users for assignment
    Promise.all([
      apiClient.get('/api/leads').catch(() => []),
      apiClient.get('/api/customers').catch(() => []),
      apiClient.get('/api/users').catch(() => [])
    ]).then(([leadsData, customersData, usersData]) => {
      setLeads(Array.isArray(leadsData) ? leadsData : [])
      setCustomers(Array.isArray(customersData) ? customersData : [])
      setUsers(Array.isArray(usersData) ? usersData : [])
    })
  }, [])

  const initialValues: CreateTaskRequest = {
    title: initialData.title || '',
    description: initialData.description || '',
    status: (initialData.status as TaskStatus) || 'PENDING',
    priority: (initialData.priority as TaskPriority) || 'MEDIUM',
    dueDate: initialData.dueDate 
      ? new Date(initialData.dueDate).toISOString().slice(0, 16) 
      : '',
    assignedToId: initialData.assignedTo?.id || '',
    leadId: initialData.lead?.id || '',
    customerId: initialData.customer?.id || '',
  }

  const handleSubmit = async (values: CreateTaskRequest, { setSubmitting }: any) => {
    try {
      setError('')
      await onSubmit(values)
    } catch (err: any) {
      setError(err.message || 'Failed to save task')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
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
                
                <FormField name="title" label="Title" required placeholder="Task title" />
                <FormField name="description" label="Description" as="textarea" rows={3} placeholder="Task details and requirements" />
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField name="priority" label="Priority" as="select">
                    {taskPriorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.icon} {priority.label}
                      </option>
                    ))}
                  </FormField>
                  
                  <FormField name="status" label="Status" as="select">
                    {taskStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.icon} {status.label}
                      </option>
                    ))}
                  </FormField>
                  
                  <FormField name="dueDate" label="Due Date" type="datetime-local" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField name="assignedToId" label="Assign To" as="select">
                    <option value="">Select User</option>
                    {users.map((user: any) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </FormField>
                  
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