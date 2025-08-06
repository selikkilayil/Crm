'use client'

import { Quotation } from '../types'

export class QuotationClientService {
  async getAll(params?: { status?: string; search?: string }): Promise<Quotation[]> {
    try {
      const searchParams = new URLSearchParams()
      if (params?.status && params.status !== 'all') {
        searchParams.append('status', params.status)
      }
      if (params?.search) {
        searchParams.append('search', params.search)
      }
      
      const response = await fetch(`/api/quotations?${searchParams}`)
      if (response.ok) {
        return await response.json()
      }
      return []
    } catch (error) {
      console.error('Failed to fetch quotations:', error)
      return []
    }
  }

  async getById(id: string): Promise<Quotation | null> {
    try {
      const response = await fetch(`/api/quotations/${id}`)
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Failed to fetch quotation:', error)
      return null
    }
  }

  async duplicate(quotationId: string, createdById: string): Promise<Quotation> {
    const response = await fetch(`/api/quotations/${quotationId}/duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ createdById }),
    })

    if (!response.ok) {
      throw new Error('Failed to duplicate quotation')
    }

    return await response.json()
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`/api/quotations/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Failed to delete quotation')
    }
  }

  async generatePDF(id: string): Promise<Blob> {
    const response = await fetch(`/api/quotations/${id}/pdf`)
    
    if (!response.ok) {
      throw new Error('Failed to generate PDF')
    }

    return await response.blob()
  }

  downloadPDF(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }
}

export const quotationClientService = new QuotationClientService()