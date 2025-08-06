'use client'

import { useState, useEffect } from 'react'
import { quotationClientService } from '../services/QuotationClientService'
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
      const data = await quotationClientService.getAll({
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
      const newQuotation = await quotationClientService.duplicate(quotationId, createdById)
      setQuotations(prev => [newQuotation, ...prev])
      return newQuotation
    } catch (error) {
      console.error('Failed to duplicate quotation:', error)
      throw error
    }
  }

  const removeQuotation = async (id: string) => {
    try {
      await quotationClientService.delete(id)
      setQuotations(prev => prev.filter(quotation => quotation.id !== id))
    } catch (error) {
      console.error('Failed to delete quotation:', error)
      throw error
    }
  }

  const generatePDF = async (id: string, filename: string) => {
    try {
      const blob = await quotationClientService.generatePDF(id)
      quotationClientService.downloadPDF(blob, filename)
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