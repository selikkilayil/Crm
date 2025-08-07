'use client'

import { Field, ErrorMessage } from 'formik'
import { ReactNode } from 'react'

interface FormFieldProps {
  name: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
  children?: ReactNode
  as?: 'input' | 'textarea' | 'select'
  rows?: number
}

export default function FormField({
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  className = '',
  children,
  as = 'input',
  rows = 3
}: FormFieldProps) {
  const baseInputClasses = `
    w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    disabled:bg-gray-100 disabled:cursor-not-allowed
    text-gray-900 placeholder-gray-500
  `.trim().replace(/\s+/g, ' ')

  return (
    <div className={`space-y-1 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <Field name={name}>
        {({ field, meta }: any) => (
          <>
            {as === 'textarea' ? (
              <textarea
                {...field}
                id={name}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                className={`${baseInputClasses} ${
                  meta.touched && meta.error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                }`}
              />
            ) : as === 'select' ? (
              <select
                {...field}
                id={name}
                disabled={disabled}
                className={`${baseInputClasses} ${
                  meta.touched && meta.error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                }`}
              >
                {children}
              </select>
            ) : (
              <input
                {...field}
                id={name}
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                className={`${baseInputClasses} ${
                  meta.touched && meta.error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''
                }`}
              />
            )}
          </>
        )}
      </Field>
      
      <ErrorMessage name={name} component="div" className="text-sm text-red-600 mt-1" />
    </div>
  )
}