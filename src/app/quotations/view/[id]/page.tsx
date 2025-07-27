'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import NavBar from '@/components/NavBar'

interface Customer {
  id: string
  name: string
  email: string
  company?: string
  phone?: string
  billingAddress?: string
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

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: '📝' },
  SENT: { label: 'Sent', color: 'bg-blue-100 text-blue-800', icon: '📤' },
  ACCEPTED: { label: 'Accepted', color: 'bg-green-100 text-green-800', icon: '✅' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: '❌' },
  EXPIRED: { label: 'Expired', color: 'bg-yellow-100 text-yellow-800', icon: '⏰' },
}

export default function QuotationViewPage() {
  const params = useParams()
  const router = useRouter()
  const quotationId = params.id as string
  
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchQuotation()
  }, [quotationId])

  const fetchQuotation = async () => {
    try {
      const response = await fetch(`/api/quotations/${quotationId}`)
      if (response.ok) {
        const data = await response.json()
        setQuotation(data)
      } else {
        router.push('/quotations')
      }
    } catch (error) {
      console.error('Failed to fetch quotation:', error)
      router.push('/quotations')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!quotation) return
    
    setUpdating(true)
    try {
      const response = await fetch(`/api/quotations/${quotationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        await fetchQuotation()
      } else {
        alert('Failed to update quotation status')
      }
    } catch (error) {
      console.error('Error updating quotation status:', error)
      alert('Failed to update quotation status')
    } finally {
      setUpdating(false)
    }
  }

  const handleEdit = () => {
    router.push(`/quotations/edit/${quotationId}`)
  }

  const handleDuplicate = async () => {
    try {
      const response = await fetch(`/api/quotations/${quotationId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const newQuotation = await response.json()
        router.push(`/quotations/edit/${newQuotation.id}`)
      } else {
        alert('Failed to duplicate quotation')
      }
    } catch (error) {
      console.error('Error duplicating quotation:', error)
      alert('Failed to duplicate quotation')
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/quotations/${quotationId}/pdf`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `quotation-${quotation?.quotationNumber || quotationId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to generate PDF')
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to download PDF')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const handleBack = () => {
    router.push('/quotations')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-700">Loading quotation...</p>
        </div>
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-4xl text-gray-400 mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Quotation not found</h3>
          <p className="text-gray-500 mb-4">The quotation you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={handleBack}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Back to Quotations
          </button>
        </div>
      </div>
    )
  }

  const status = statusConfig[quotation.status]

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="quotations" />

        <main className="max-w-5xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-6">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <button 
                onClick={handleBack}
                className="hover:text-gray-700 transition-colors"
              >
                Quotations
              </button>
              <span className="mx-2">›</span>
              <span className="text-gray-900 font-medium">{quotation.quotationNumber}</span>
            </div>

            {/* Quotation Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg font-bold">
                        {quotation.quotationNumber.slice(-2)}
                      </span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{quotation.quotationNumber}</h1>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          <span className="mr-1">{status.icon}</span>
                          {status.label}
                        </span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-600">Created on {formatDate(quotation.date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Billed To:</h3>
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">{quotation.customer.name}</p>
                      {quotation.customer.company && (
                        <p className="text-gray-600">{quotation.customer.company}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="mr-1">📧</span>
                          <a href={`mailto:${quotation.customer.email}`} className="text-purple-600 hover:text-purple-800">
                            {quotation.customer.email}
                          </a>
                        </div>
                        {quotation.customer.phone && (
                          <div className="flex items-center">
                            <span className="mr-1">📱</span>
                            <a href={`tel:${quotation.customer.phone}`} className="text-purple-600 hover:text-purple-800">
                              {quotation.customer.phone}
                            </a>
                          </div>
                        )}
                      </div>
                      {quotation.customer.billingAddress && (
                        <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">
                          {quotation.customer.billingAddress}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-48">
                  {quotation.status === 'DRAFT' && (
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <span className="mr-2">✏️</span>
                      Edit Quotation
                    </button>
                  )}
                  <button
                    onClick={handleDuplicate}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">📋</span>
                    Duplicate
                  </button>
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">←</span>
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quotation Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Quotation Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📋</span>
                Quotation Details
              </h3>
              <div className="space-y-3">
                <DetailRow label="Date" value={formatDate(quotation.date)} />
                {quotation.validUntil && (
                  <DetailRow label="Valid Until" value={formatDate(quotation.validUntil)} />
                )}
                {quotation.paymentTerms && (
                  <DetailRow label="Payment Terms" value={quotation.paymentTerms} />
                )}
                {quotation.deliveryTerms && (
                  <DetailRow label="Delivery Terms" value={quotation.deliveryTerms} />
                )}
                <DetailRow label="Currency" value={quotation.currency} />
                <DetailRow label="Created By" value={quotation.createdBy.name} />
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">💰</span>
                Amount Summary
              </h3>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(quotation.subtotal)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Total Tax</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(quotation.totalTax)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Grand Total</p>
                    <p className="text-2xl font-bold text-purple-600">{formatCurrency(quotation.grandTotal)}</p>
                  </div>
                </div>
                <div className="text-center mt-3 pt-3 border-t border-white">
                  <span className="text-sm text-gray-600">{quotation.items.length} item{quotation.items.length !== 1 ? 's' : ''}</span>
                  {quotation.totalDiscount > 0 && (
                    <span className="mx-2 text-sm text-green-600">• {formatCurrency(quotation.totalDiscount)} discount applied</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📦</span>
              Line Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Product/Service</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Qty</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Unit Price</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Discount</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-700">Tax</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quotation.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{item.productName}</div>
                          {item.description && (
                            <div className="text-gray-600 text-xs mt-1">{item.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center font-medium">{item.quantity}</td>
                      <td className="px-4 py-4 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-4 text-center">
                        {item.discount > 0 ? (
                          <span className="text-green-600 font-medium">{item.discount}%</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {item.taxPercent > 0 ? (
                          <span className="text-blue-600 font-medium">{item.taxPercent}%</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes and Terms */}
          {(quotation.notes || quotation.termsConditions) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {quotation.notes && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📝</span>
                    Notes
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-line">{quotation.notes}</p>
                  </div>
                </div>
              )}
              {quotation.termsConditions && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📜</span>
                    Terms & Conditions
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-line">{quotation.termsConditions}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">⚡</span>
              Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              {quotation.status === 'DRAFT' && (
                <button
                  onClick={() => handleStatusChange('SENT')}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  <span className="mr-2">📤</span>
                  {updating ? 'Updating...' : 'Mark as Sent'}
                </button>
              )}
              {quotation.status === 'SENT' && (
                <>
                  <button
                    onClick={() => handleStatusChange('ACCEPTED')}
                    disabled={updating}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
                  >
                    <span className="mr-2">✅</span>
                    {updating ? 'Updating...' : 'Mark as Accepted'}
                  </button>
                  <button
                    onClick={() => handleStatusChange('REJECTED')}
                    disabled={updating}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
                  >
                    <span className="mr-2">❌</span>
                    {updating ? 'Updating...' : 'Mark as Rejected'}
                  </button>
                </>
              )}
              <button 
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
              >
                <span className="mr-2">📄</span>
                Download PDF
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center">
                <span className="mr-2">📧</span>
                Send Email
              </button>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}

// Helper component for detail rows
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}