'use client'

import { useRouter } from 'next/navigation'
import { Quotation, quotationStatuses } from '../types'

interface QuotationCardProps {
  quotation: Quotation
  onView: (quotation: Quotation) => void
  onDuplicate: (quotationId: string) => void
  onDelete: (quotationId: string) => void
  onDownloadPDF: (quotationId: string, filename: string) => void
}

export default function QuotationCard({
  quotation,
  onView,
  onDuplicate,
  onDelete,
  onDownloadPDF
}: QuotationCardProps) {
  const router = useRouter()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN')
  }

  const getStatusInfo = (status: string) => {
    return quotationStatuses.find(s => s.value === status) || quotationStatuses[0]
  }

  const statusInfo = getStatusInfo(quotation.status)

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="p-6">
        {/* Card Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900">{quotation.quotationNumber}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.icon} {statusInfo.label}
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
            onClick={() => onView(quotation)}
            className="bg-gray-100 text-gray-700 p-2 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
            title="View Quotation"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          {quotation.status === 'DRAFT' && (
            <button
              onClick={() => router.push(`/quotations/edit/${quotation.id}`)}
              className="bg-white text-gray-700 border border-gray-300 p-2 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
              title="Edit Quotation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onDuplicate(quotation.id)}
            className="bg-white text-gray-700 border border-gray-300 p-2 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
            title="Duplicate Quotation"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={() => onDownloadPDF(quotation.id, `quotation-${quotation.quotationNumber}.pdf`)}
            className="bg-purple-100 text-purple-700 border border-purple-300 p-2 rounded-md hover:bg-purple-200 transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
            title="Download PDF"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(quotation.id)}
            className="bg-red-100 text-red-700 border border-red-300 p-2 rounded-md hover:bg-red-200 transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
            title="Delete Quotation"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}