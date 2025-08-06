import { useState, useEffect } from 'react'
import { quotationsService } from '../services'
import { Quotation } from '../types'

interface UseQuotationsParams {
  statusFilter?: string
  searchTerm?: string
}

export function useQuotations({ statusFilter, searchTerm }: UseQuotationsParams = {}) {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuotations = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await quotationsService.getAll({
        status: statusFilter,
        search: searchTerm
      })
      setQuotations(data)
    } catch (err) {
      console.error('Failed to fetch quotations:', err)
      setError('Failed to fetch quotations')
      setQuotations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuotations()
  }, [statusFilter, searchTerm])

  const duplicateQuotation = async (quotationId: string, createdById: string) => {
    try {
      const newQuotation = await quotationsService.duplicate(quotationId, createdById)
      setQuotations(prev => [newQuotation, ...prev])
      return newQuotation
    } catch (error) {
      console.error('Failed to duplicate quotation:', error)
      throw error
    }
  }

  const removeQuotation = async (id: string) => {
    try {
      await quotationsService.delete(id)
      setQuotations(prev => prev.filter(quotation => quotation.id !== id))
    } catch (error) {
      console.error('Failed to delete quotation:', error)
      throw error
    }
  }

  const generatePDF = async (id: string, filename: string) => {
    try {
      const blob = await quotationsService.generatePDF(id)
      quotationsService.downloadPDF(blob, filename)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
      throw error
    }
  }

  const refreshQuotations = () => {
    fetchQuotations()
  }

  return {
    quotations,
    loading,
    error,
    refreshQuotations,
    duplicateQuotation,
    removeQuotation,
    generatePDF
  }
}