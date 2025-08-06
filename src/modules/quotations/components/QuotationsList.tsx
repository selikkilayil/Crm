'use client'

import { Quotation } from '../types'
import QuotationCard from './QuotationCard'

interface QuotationsListProps {
  quotations: Quotation[]
  onView: (quotation: Quotation) => void
  onDuplicate: (quotationId: string) => void
  onDelete: (quotationId: string) => void
  onDownloadPDF: (quotationId: string, filename: string) => void
}

export default function QuotationsList({
  quotations,
  onView,
  onDuplicate,
  onDelete,
  onDownloadPDF
}: QuotationsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {quotations.map((quotation) => (
        <QuotationCard
          key={quotation.id}
          quotation={quotation}
          onView={onView}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onDownloadPDF={onDownloadPDF}
        />
      ))}
    </div>
  )
}