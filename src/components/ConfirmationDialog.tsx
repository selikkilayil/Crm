'use client'

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info' | 'success'
  icon?: 'delete' | 'warning' | 'info' | 'success' | 'archive'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  icon = 'warning',
  onConfirm,
  onCancel
}: ConfirmationDialogProps) {
  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          border: 'border-red-200'
        }
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          border: 'border-yellow-200'
        }
      case 'info':
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          border: 'border-blue-200'
        }
      case 'success':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          confirmButton: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
          border: 'border-green-200'
        }
      default:
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          border: 'border-red-200'
        }
    }
  }

  const getIcon = () => {
    switch (icon) {
      case 'delete':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
            />
          </svg>
        )
      case 'warning':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 18.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        )
      case 'info':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        )
      case 'success':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        )
      case 'archive':
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M5 8l6 6m0 0l6-6m-6 6V3m-9 15h18a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" 
            />
          </svg>
        )
      default:
        return (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 18.5c-.77.833.192 2.5 1.732 2.5z" 
            />
          </svg>
        )
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity"
          onClick={onCancel}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal dialog */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:items-start">
            {/* Icon */}
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}>
              <div className={styles.iconColor}>
                {getIcon()}
              </div>
            </div>

            {/* Content */}
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {message}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onConfirm}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${styles.confirmButton}`}
            >
              {confirmText}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hook for easier usage
export function useConfirmationDialog() {
  const [dialog, setDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    type?: 'danger' | 'warning' | 'info' | 'success'
    icon?: 'delete' | 'warning' | 'info' | 'success' | 'archive'
    onConfirm?: () => void
  }>({
    isOpen: false,
    title: '',
    message: ''
  })

  const showConfirmation = (options: {
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    type?: 'danger' | 'warning' | 'info' | 'success'
    icon?: 'delete' | 'warning' | 'info' | 'success' | 'archive'
    onConfirm: () => void
  }) => {
    setDialog({
      isOpen: true,
      ...options
    })
  }

  const hideConfirmation = () => {
    setDialog(prev => ({ ...prev, isOpen: false }))
  }

  const ConfirmationComponent = () => (
    <ConfirmationDialog
      isOpen={dialog.isOpen}
      title={dialog.title}
      message={dialog.message}
      confirmText={dialog.confirmText}
      cancelText={dialog.cancelText}
      type={dialog.type}
      icon={dialog.icon}
      onConfirm={() => {
        dialog.onConfirm?.()
        hideConfirmation()
      }}
      onCancel={hideConfirmation}
    />
  )

  return {
    showConfirmation,
    hideConfirmation,
    ConfirmationComponent
  }
}

import { useState } from 'react'