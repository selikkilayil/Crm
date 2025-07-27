'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import AuthGuard from '@/components/AuthGuard'
import NavBar from '@/components/NavBar'

interface Customer {
  id: string
  name: string
  email: string
  company?: string
  phone?: string
}

interface QuotationItem {
  id?: string
  productName: string
  description?: string
  quantity: number
  unitPrice: number
  discount: number
  taxPercent: number
  subtotal: number
}

interface Quotation {
  id: string
  quotationNumber: string
  date: string
  validUntil?: string
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  paymentTerms?: string
  deliveryTerms?: string
  currency: string
  subtotal: number
  totalTax: number
  totalDiscount: number
  grandTotal: number
  notes?: string
  termsConditions?: string
  customer: Customer
  createdBy: {
    id: string
    name: string
    email: string
  }
  items: QuotationItem[]
  createdAt: string
  updatedAt: string
}


export default function QuotationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchQuotations()
  }, [statusFilter, searchTerm])

  const fetchQuotations = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/quotations?${params}`)
      if (response.ok) {
        const data = await response.json()
        setQuotations(data)
      }
    } catch (error) {
      console.error('Error fetching quotations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuotation = () => {
    router.push('/quotations/create')
  }

  const handleViewQuotation = (quotation: Quotation) => {
    router.push(`/quotations/view/${quotation.id}`)
  }

  const handleDuplicateQuotation = async (quotationId: string) => {
    try {
      const response = await fetch(`/api/quotations/${quotationId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ createdById: user?.id }),
      })

      if (response.ok) {
        fetchQuotations()
      }
    } catch (error) {
      console.error('Error duplicating quotation:', error)
    }
  }

  const handleStatusChange = async (quotationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchQuotations()
      }
    } catch (error) {
      console.error('Error updating quotation status:', error)
    }
  }

  const handleDeleteQuotation = async (quotationId: string) => {
    if (!confirm('Are you sure you want to delete this quotation? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchQuotations()
      } else {
        throw new Error('Failed to delete quotation')
      }
    } catch (error) {
      console.error('Error deleting quotation:', error)
      alert('Failed to delete quotation. Please try again.')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN')
  }

  if (loading) {
    return (
      <div className="loading-overlay-full">
        <div className="loading-spinner loading-spinner-lg"></div>
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
                  Professional Quotations
                </h1>
                <p className="text-lg text-purple-100">Manage and track your business quotations with style</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Total', value: quotations.length, color: 'bg-gradient-to-br from-blue-500 to-blue-600', icon: '📄' },
              { label: 'Draft', value: quotations.filter(q => q.status === 'DRAFT').length, color: 'bg-gradient-to-br from-gray-500 to-gray-600', icon: '📝' },
              { label: 'Sent', value: quotations.filter(q => q.status === 'SENT').length, color: 'bg-gradient-to-br from-blue-500 to-indigo-600', icon: '📤' },
              { label: 'Accepted', value: quotations.filter(q => q.status === 'ACCEPTED').length, color: 'bg-gradient-to-br from-green-500 to-green-600', icon: '✅' },
              { label: 'Rejected', value: quotations.filter(q => q.status === 'REJECTED').length, color: 'bg-gradient-to-br from-red-500 to-red-600', icon: '❌' },
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="p-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white mr-3 shadow-lg`}>
                      <span className="text-lg">{stat.icon}</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                <label className="form-label">Search Quotations</label>
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
                <label className="form-label">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="EXPIRED">Expired</option>
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
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="empty-state-title">No quotations found</h3>
            <p className="empty-state-description">
              {searchTerm || statusFilter !== 'all' 
                ? 'No quotations match your current filters. Try adjusting your search criteria.'
                : 'Get started by creating your first quotation for your customers.'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <button
                onClick={handleCreateQuotation}
                className="btn btn-primary"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Your First Quotation
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {quotations.map((quotation) => (
              <div
                key={quotation.id}
                className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{quotation.quotationNumber}</h3>
                        <span className={`badge ${
                          quotation.status === 'DRAFT' ? 'badge-gray' :
                          quotation.status === 'SENT' ? 'badge-primary' :
                          quotation.status === 'ACCEPTED' ? 'badge-success' :
                          quotation.status === 'REJECTED' ? 'badge-danger' :
                          'badge-warning'
                        }`}>
                          {quotation.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">{quotation.customer.name}</p>
                        {quotation.customer.company && (
                          <p className="text-sm text-gray-700">{quotation.customer.company}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <p className="font-medium text-gray-900">{formatDate(quotation.date)}</p>
                      </div>
                      {quotation.validUntil && (
                        <div>
                          <span className="text-gray-600">Valid Until:</span>
                          <p className="font-medium text-gray-900">{formatDate(quotation.validUntil)}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Amount:</span>
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(quotation.grandTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
                        <span>{quotation.items.length} item{quotation.items.length !== 1 ? 's' : ''}</span>
                        <span>Created by {quotation.createdBy.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewQuotation(quotation)}
                      className="btn btn-secondary btn-sm flex-1"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                    {quotation.status === 'DRAFT' && (
                      <button
                        onClick={() => router.push(`/quotations/edit/${quotation.id}`)}
                        className="btn btn-outline btn-sm flex-1"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => handleDuplicateQuotation(quotation.id)}
                      className="btn btn-outline btn-sm flex-1"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                    {quotation.status === 'DRAFT' && (
                      <button
                        onClick={() => handleDeleteQuotation(quotation.id)}
                        className="btn btn-danger btn-sm flex-1"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    )}
                    {quotation.status === 'DRAFT' && (
                      <button
                        onClick={() => handleStatusChange(quotation.id, 'SENT')}
                        className="btn btn-success btn-sm flex-1"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        </div>
      </div>
    </AuthGuard>
  )
}


