'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import ConfirmationDialog from '@/components/ConfirmationDialog'

export interface ConfirmationOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info' | 'success'
  icon?: 'delete' | 'warning' | 'info' | 'success' | 'archive'
}

interface ConfirmationContextType {
  confirm: (options: ConfirmationOptions) => Promise<boolean>
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined)

export function ConfirmationProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<{
    isOpen: boolean
    resolve?: (value: boolean) => void
  } & ConfirmationOptions>({
    isOpen: false,
    title: '',
    message: ''
  })

  const confirm = (options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        resolve,
        ...options
      })
    })
  }

  const handleConfirm = () => {
    dialog.resolve?.(true)
    setDialog(prev => ({ ...prev, isOpen: false }))
  }

  const handleCancel = () => {
    dialog.resolve?.(false)
    setDialog(prev => ({ ...prev, isOpen: false }))
  }

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      <ConfirmationDialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        type={dialog.type}
        icon={dialog.icon}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmationContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmationContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmationProvider')
  }
  return context.confirm
}