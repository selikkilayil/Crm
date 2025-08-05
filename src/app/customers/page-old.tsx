'use client'

import { useState, useEffect } from 'react'
import { AuthGuard } from '@/shared/components'
import { NavBar } from '@/shared/components'

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  billingAddress: string | null
  gstin: string | null
  createdAt: string
  updatedAt: string
  leadId: string | null
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      const data = await response.json()
      
      if (response.ok && Array.isArray(data)) {
        setCustomers(data)
      } else {
        console.error('API Error:', data)
        setCustomers([])
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const addCustomer = async (customerData: Partial<Customer>) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      })

      if (response.ok) {
        const newCustomer = await response.json()
        setCustomers([newCustomer, ...customers])
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Failed to add customer:', error)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="customers" />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Add New Customer
            </button>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <li key={customer.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-medium text-blue-600 truncate">
                            {customer.name}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Customer
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <span className="mr-2">📧</span>
                              {customer.email}
                            </p>
                            {customer.phone && (
                              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                <span className="mr-2">📞</span>
                                {customer.phone}
                              </p>
                            )}
                          </div>
                          
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <span className="mr-2">🏢</span>
                            {customer.company || 'No company'}
                          </div>
                        </div>
                        
                        {customer.billingAddress && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              <span className="mr-2">📍</span>
                              {customer.billingAddress}
                            </p>
                          </div>
                        )}
                        
                        {customer.gstin && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              <span className="mr-2">🏛️</span>
                              GSTIN: {customer.gstin}
                            </p>
                          </div>
                        )}
                        
                        <div className="mt-2">
                          <p className="text-xs text-gray-400">
                            Added on {new Date(customer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            {customers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No customers found. Add your first customer!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showAddForm && (
        <AddCustomerModal onAdd={addCustomer} onClose={() => setShowAddForm(false)} />
      )}
    </div>
    </AuthGuard>
  )
}

function AddCustomerModal({ onAdd, onClose }: { onAdd: (data: any) => void, onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    billingAddress: '',
    gstin: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Billing Address</label>
            <textarea
              value={formData.billingAddress}
              onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">GSTIN</label>
            <input
              type="text"
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Add Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}