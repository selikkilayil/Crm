'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/shared/hooks'
import { useConfirm } from '@/lib/confirmation-context'
import { AuthGuard, NavBar } from '@/shared/components'
import {
  QuotationsList,
  QuotationsStats,
  useQuotations,
  quotationStatuses,
  Quotation
} from '@/domains/quotations'



export default function QuotationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const confirm = useConfirm()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  const { quotations, loading, duplicateQuotation, removeQuotation, generatePDF } = useQuotations({ 
    statusFilter, 
    searchTerm 
  })

  const handleCreateQuotation = () => {
    router.push('/quotations/create')
  }

  const handleViewQuotation = (quotation: Quotation) => {
    router.push(`/quotations/view/${quotation.id}`)
  }

  const handleDuplicateQuotation = async (quotationId: string) => {
    try {
      await duplicateQuotation(quotationId, user?.id || '')
      alert('Quotation duplicated successfully!')
    } catch (error) {
      console.error('Error duplicating quotation:', error)
      alert('Failed to duplicate quotation. Please try again.')
    }
  }

  const handleDownloadPDF = async (quotationId: string, filename: string) => {
    try {
      await generatePDF(quotationId, filename)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF. Please try again.')
    }
  }

  const handleDeleteQuotation = async (quotationId: string) => {
    const result = await confirm({
      title: 'Delete Quotation',
      message: 'Are you sure you want to delete this quotation? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'delete'
    })
    
    if (!result) return

    try {
      await removeQuotation(quotationId)
      alert('Quotation deleted successfully!')
    } catch (error) {
      console.error('Error deleting quotation:', error)
      alert('Failed to delete quotation. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-700">Loading quotations...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="quotations" />
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* 🎯 PROFESSIONAL HEADER - NOW UPDATED! */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center">
                  <span className="mr-3">📋</span>
                  Quotations
                </h1>
                <p className="text-lg text-purple-100">Manage and track your business quotations</p>
              </div>
              <button
                onClick={handleCreateQuotation}
                className="bg-white text-purple-600 hover:bg-purple-50 px-6 py-3 rounded-lg font-semibold mt-4 sm:mt-0 transition-colors shadow-lg flex items-center"
              >
                <span className="mr-2">✨</span>
                Create New Quotation
              </button>
            </div>
          </div>

          {/* 📊 PROFESSIONAL STATS CARDS */}
          <QuotationsStats quotations={quotations} />
        </div>

        {/* 🔍 PROFESSIONAL FILTERS */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🔍</span>
              Search & Filter Quotations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Quotations</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by quotation number, customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Status</option>
                  {quotationStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.icon} {status.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                  }}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quotations Content */}
        {quotations.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'No quotations match your current filters. Try adjusting your search criteria.'
                : 'Get started by creating your first quotation for your customers.'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <button
                onClick={handleCreateQuotation}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center mx-auto"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Quotation
              </button>
            )}
          </div>
        ) : (
          <QuotationsList
            quotations={quotations}
            onView={handleViewQuotation}
            onDuplicate={handleDuplicateQuotation}
            onDelete={handleDeleteQuotation}
            onDownloadPDF={handleDownloadPDF}
          />
        )}
        </div>
      </div>
    </AuthGuard>
  )
}