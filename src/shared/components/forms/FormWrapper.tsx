'use client'

import { Formik, Form, FormikHelpers } from 'formik'
import * as Yup from 'yup'
import { ReactNode } from 'react'

interface FormWrapperProps<T> {
  initialValues: T
  validationSchema?: Yup.Schema<any>
  onSubmit: (values: T, formikHelpers: FormikHelpers<T>) => void | Promise<void>
  enableReinitialize?: boolean
  className?: string
  children: ReactNode | ((props: any) => ReactNode)
}

export default function FormWrapper<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
  enableReinitialize = false,
  className = '',
  children
}: FormWrapperProps<T>) {
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      enableReinitialize={enableReinitialize}
    >
      {(formikProps) => (
        <Form className={`space-y-6 ${className}`}>
          {typeof children === 'function' ? children(formikProps) : children}
        </Form>
      )}
    </Formik>
  )
}