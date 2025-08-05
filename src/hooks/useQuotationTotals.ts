import { useMemo } from 'react'

interface QuotationItem {
  quantity: number
  unitPrice: number
  calculatedPrice?: number
  discount: number
  taxPercent: number
}

interface QuotationTotals {
  subtotal: number
  totalDiscount: number
  totalTax: number
  grandTotal: number
  items: {
    lineSubtotal: number
    discountAmount: number
    taxableAmount: number
    taxAmount: number
    lineTotal: number
  }[]
}

export function useQuotationTotals(items: QuotationItem[], roundOff: number = 0): QuotationTotals {
  return useMemo(() => {
    let subtotal = 0
    let totalDiscount = 0
    let totalTax = 0
    
    const itemCalculations = items.map(item => {
      const lineSubtotal = item.quantity * (item.calculatedPrice || item.unitPrice)
      const discountAmount = (lineSubtotal * item.discount) / 100
      const taxableAmount = lineSubtotal - discountAmount
      const taxAmount = (taxableAmount * item.taxPercent) / 100
      const lineTotal = taxableAmount + taxAmount
      
      subtotal += lineSubtotal
      totalDiscount += discountAmount
      totalTax += taxAmount
      
      return {
        lineSubtotal,
        discountAmount,
        taxableAmount,
        taxAmount,
        lineTotal
      }
    })
    
    const grandTotal = subtotal - totalDiscount + totalTax + roundOff
    
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
      totalTax: Math.round(totalTax * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
      items: itemCalculations
    }
  }, [items, roundOff])
}

export function calculateItemTotal(item: QuotationItem): number {
  const lineSubtotal = item.quantity * (item.calculatedPrice || item.unitPrice)
  const discountAmount = (lineSubtotal * item.discount) / 100
  const taxableAmount = lineSubtotal - discountAmount
  const taxAmount = (taxableAmount * item.taxPercent) / 100
  return taxableAmount + taxAmount
}