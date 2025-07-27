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
  productName: string
  description?: string
  quantity: number
  unitPrice: number
  discount: number
  taxPercent: number
}

export default function CreateQuotationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    customerId: '',
    validUntil: '',
    paymentTerms: '',
    deliveryTerms: '',
    currency: 'INR',
    notes: '',
    termsConditions: '',
  })
  
  const [items, setItems] = useState<QuotationItem[]>([
    { productName: '', description: '', quantity: 1, unitPrice: 0, discount: 0, taxPercent: 0 }
  ])

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.filter((c: Customer) => !c.isArchived))
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const addItem = () => {
    setItems([...items, { productName: '', description: '', quantity: 1, unitPrice: 0, discount: 0, taxPercent: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setItems(updatedItems)
  }

  const calculateItemTotal = (item: QuotationItem) => {
    const lineSubtotal = item.quantity * item.unitPrice
    const discountAmount = (lineSubtotal * item.discount) / 100
    const taxableAmount = lineSubtotal - discountAmount
    const taxAmount = (taxableAmount * item.taxPercent) / 100
    return taxableAmount + taxAmount
  }

  const calculateTotals = () => {
    let subtotal = 0
    let totalTax = 0
    let totalDiscount = 0

    items.forEach(item => {
      const lineSubtotal = item.quantity * item.unitPrice
      const discountAmount = (lineSubtotal * item.discount) / 100
      const taxAmount = ((lineSubtotal - discountAmount) * item.taxPercent) / 100
      
      subtotal += lineSubtotal
      totalDiscount += discountAmount
      totalTax += taxAmount
    })

    const grandTotal = subtotal - totalDiscount + totalTax

    return { subtotal, totalTax, totalDiscount, grandTotal }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items,
          createdById: user?.id,
        }),
      })

      if (response.ok) {
        router.push('/quotations')
      } else {
        throw new Error('Failed to create quotation')
      }
    } catch (error) {
      console.error('Error creating quotation:', error)
      alert('Failed to create quotation. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const totals = calculateTotals()

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <NavBar currentPage="quotations" />
          <div className="loading-overlay-full">
            <div className="loading-spinner loading-spinner-lg"></div>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="quotations" />
        
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => router.back()}
                className="btn btn-secondary"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>
              <div>
                <h1 className="text-3xl font-bold text-black">Create New Quotation</h1>
                <p className="text-lg text-black">Fill in the details below to create a new quotation</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Customer Information */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Customer Information</h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label form-label-required">Customer</label>
                    <select
                      value={formData.customerId}
                      onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                      required
                      className="form-select"
                    >
                      <option value="">Select Customer</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} {customer.company && `(${customer.company})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Valid Until</label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Terms</label>
                    <input
                      type="text"
                      value={formData.paymentTerms}
                      onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                      placeholder="e.g., 50% advance, 50% on delivery"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Delivery Terms</label>
                    <input
                      type="text"
                      value={formData.deliveryTerms}
                      onChange={(e) => setFormData({ ...formData, deliveryTerms: e.target.value })}
                      placeholder="e.g., 7-10 working days"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h2 className="card-title">Line Items</h2>
                  <button
                    type="button"
                    onClick={addItem}
                    className="btn btn-primary btn-sm"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Item
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="space-y-6">
                  {items.map((item, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="md:col-span-2 form-group">
                          <label className="form-label form-label-required">Product/Service</label>
                          <input
                            type="text"
                            value={item.productName}
                            onChange={(e) => updateItem(index, 'productName', e.target.value)}
                            required
                            className="form-input"
                            placeholder="Enter product or service name"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label form-label-required">Quantity</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            required
                            className="form-input"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label form-label-required">Unit Price (₹)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            required
                            className="form-input"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Discount (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.discount}
                            onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)}
                            className="form-input"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Tax (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.taxPercent}
                            onChange={(e) => updateItem(index, 'taxPercent', parseFloat(e.target.value) || 0)}
                            className="form-input"
                          />
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                            className="form-input"
                            placeholder="Optional description"
                          />
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <span className="text-sm text-black">Line Total:</span>
                            <p className="text-lg font-bold text-black">₹{calculateItemTotal(item).toFixed(2)}</p>
                          </div>
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="btn btn-danger btn-sm"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Quotation Summary</h2>
              </div>
              <div className="card-body">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-800">Subtotal:</span>
                      <span className="text-gray-800">₹{totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-800">Total Discount:</span>
                      <span className="text-gray-800">-₹{totals.totalDiscount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-800">Total Tax:</span>
                      <span className="text-gray-800">₹{totals.totalTax.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-3">
                      <div className="flex justify-between text-2xl font-bold">
                        <span className="text-black font-bold">Grand Total:</span>
                        <span className="text-black font-bold">₹{totals.grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Additional Information</h2>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      className="form-textarea"
                      placeholder="Internal notes (optional)"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Terms & Conditions</label>
                    <textarea
                      value={formData.termsConditions}
                      onChange={(e) => setFormData({ ...formData, termsConditions: e.target.value })}
                      rows={4}
                      className="form-textarea"
                      placeholder="Terms and conditions (optional)"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pb-8">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? (
                  <>
                    <div className="loading-spinner loading-spinner-sm mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Create Quotation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}