'use client'

import { useState } from 'react'
import * as Yup from 'yup'
import { FormWrapper, FormField, FormButton, FormErrorMessage } from '@/shared/components'
import { CustomerFormData } from '../types'

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => Promise<void>
  onClose: () => void
  initialData?: Partial<CustomerFormData>
  title?: string
  submitLabel?: string
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().nullable(),
  company: Yup.string().nullable(),
  billingAddress: Yup.string().nullable(),
  shippingAddress: Yup.string().nullable(),
  gstin: Yup.string().nullable(),
  notes: Yup.string().nullable(),
})

export default function CustomerForm({
  onSubmit,
  onClose,
  initialData = {},
  title = 'Add New Customer',
  submitLabel = 'Add Customer'
}: CustomerFormProps) {
  const [error, setError] = useState('')
  const [sameAddress, setSameAddress] = useState(false)

  const initialValues: CustomerFormData = {
    name: initialData.name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    company: initialData.company || '',
    billingAddress: initialData.billingAddress || '',
    shippingAddress: initialData.shippingAddress || '',
    gstin: initialData.gstin || '',
    notes: initialData.notes || '',
  }

  const handleSubmit = async (values: CustomerFormData, { setSubmitting }: any) => {
    try {
      setError('')
      const submitData = {
        ...values,
        shippingAddress: sameAddress ? values.billingAddress : values.shippingAddress
      }
      await onSubmit(submitData)
    } catch (err: any) {
      setError(err.message || 'Failed to save customer')
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
                
                {/* Basic Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <FormField name="name" label="Name" required />
                  </div>
                  
                  <FormField name="email" label="Email" type="email" required />
                  <FormField name="phone" label="Phone" type="tel" />
                  <FormField name="company" label="Company" />
                  <FormField name="gstin" label="GSTIN" />
                </div>
                
                {/* Addresses */}
                <div className="space-y-4">
                  <FormField name="billingAddress" label="Billing Address" as="textarea" rows={3} />
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sameAddress"
                      checked={sameAddress}
                      onChange={(e) => {
                        setSameAddress(e.target.checked)
                        if (e.target.checked) {
                          setFieldValue('shippingAddress', values.billingAddress)
                        }
                      }}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sameAddress" className="ml-2 text-sm text-gray-700">
                      Shipping address same as billing
                    </label>
                  </div>
                  
                  {!sameAddress && (
                    <FormField name="shippingAddress" label="Shipping Address" as="textarea" rows={3} />
                  )}
                </div>
                
                <FormField name="notes" label="Notes" as="textarea" rows={3} />
                
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
                    variant="success"
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