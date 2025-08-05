'use client'

import { useConfirm } from '@/lib/confirmation-context'

export default function TestConfirmationPage() {
  const confirm = useConfirm()

  const handleDelete = async () => {
    const result = await confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'delete'
    })

    if (result) {
      alert('Item deleted!')
    } else {
      alert('Delete cancelled')
    }
  }

  const handleArchive = async () => {
    const result = await confirm({
      title: 'Archive Item',
      message: 'This item will be moved to the archive. You can restore it later.',
      confirmText: 'Archive',
      cancelText: 'Cancel',
      type: 'warning',
      icon: 'archive'
    })

    if (result) {
      alert('Item archived!')
    } else {
      alert('Archive cancelled')
    }
  }

  const handleInfo = async () => {
    const result = await confirm({
      title: 'Information',
      message: 'This is an informational dialog. Do you want to proceed?',
      confirmText: 'Proceed',
      cancelText: 'Cancel',
      type: 'info',
      icon: 'info'
    })

    if (result) {
      alert('Proceeded!')
    } else {
      alert('Cancelled')
    }
  }

  const handleSuccess = async () => {
    const result = await confirm({
      title: 'Success Action',
      message: 'This action will mark the item as complete. Are you ready?',
      confirmText: 'Complete',
      cancelText: 'Cancel',
      type: 'success',
      icon: 'success'
    })

    if (result) {
      alert('Marked as complete!')
    } else {
      alert('Cancelled')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Confirmation Dialogs</h1>
        
        <div className="space-y-4">
          <button
            onClick={handleDelete}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Test Delete Dialog
          </button>

          <button
            onClick={handleArchive}
            className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Test Archive Dialog
          </button>

          <button
            onClick={handleInfo}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Test Info Dialog
          </button>

          <button
            onClick={handleSuccess}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Test Success Dialog
          </button>
        </div>

        <div className="mt-6 p-4 bg-gray-100 rounded-md">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Usage Example:</h2>
          <pre className="text-xs text-gray-600 overflow-x-auto">
{`const confirm = useConfirm()

const result = await confirm({
  title: 'Delete Item',
  message: 'Are you sure?',
  type: 'danger',
  icon: 'delete'
})

if (result) {
  // User confirmed
}`}
          </pre>
        </div>
      </div>
    </div>
  )
}