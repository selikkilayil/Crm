'use client'

import { useState } from 'react'
import * as Yup from 'yup'
import { FormWrapper, FormField, FormButton, FormErrorMessage } from '@/shared/components/forms'
import { TagFormData, predefinedColors, Tag } from '../types'

interface TagFormProps {
  onSubmit: (data: TagFormData) => Promise<void>
  onClose: () => void
  initialData?: Partial<Tag>
  title?: string
  submitLabel?: string
}

const validationSchema = Yup.object({
  name: Yup.string().required('Tag name is required'),
  color: Yup.string().required('Color is required'),
  description: Yup.string(),
})

export default function TagForm({
  onSubmit,
  onClose,
  initialData = {},
  title = 'Create New Tag',
  submitLabel = 'Create Tag'
}: TagFormProps) {
  const [error, setError] = useState('')

  const initialValues: TagFormData = {
    name: initialData.name || '',
    color: initialData.color || predefinedColors[0],
    description: initialData.description || '',
  }

  const handleSubmit = async (values: TagFormData, { setSubmitting }: any) => {
    try {
      setError('')
      await onSubmit(values)
    } catch (err: any) {
      setError(err.message || 'Failed to save tag')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
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
                  name="name"
                  label="Tag Name"
                  required
                  placeholder="Enter tag name"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                  <div className="grid grid-cols-5 gap-2">
                    {predefinedColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFieldValue('color', color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          values.color === color
                            ? 'border-gray-400 ring-2 ring-blue-500 ring-offset-2'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                
                <FormField
                  name="description"
                  label="Description"
                  as="textarea"
                  rows={3}
                  placeholder="Optional description for this tag"
                />
                
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