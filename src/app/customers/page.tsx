'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthGuard from '@/components/AuthGuard'
import LayoutWithVerticalNav from '@/components/LayoutWithVerticalNav'
import ActivityTimeline from '@/components/ActivityTimeline'
import TaskSection from '@/components/TaskSection'
import TagComponent from '@/components/TagComponent'
import { FormWrapper, FormField, FormButton, FormErrorMessage } from '@/components/forms'
import * as Yup from 'yup'
import apiClient from '@/lib/api-client'

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  billingAddress: string | null
  shippingAddress: string | null
  gstin: string | null
  notes: string | null
  isArchived: boolean
  createdAt: string
  updatedAt: string
  leadId: string | null
  contacts?: Contact[]
  activities?: Activity[]
  tags?: Tag[]
}

interface Contact {
  id: string
  name: string
  email: string | null
  phone: string | null
  position: string | null
  isPrimary: boolean
}

interface Activity {
  id: string
  type: string
  title: string
  description: string | null
  createdAt: string
  completedAt: string | null
}

interface Tag {
  id: string
  name: string
  color: string
  description?: string | null
}

export default function EnhancedCustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'created'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchCustomers()
    fetchTags()
  }, [])

  const fetchCustomers = async () => {
    try {
      const data = await apiClient.get('/api/customers')
      
      if (Array.isArray(data)) {
        setCustomers(data.filter((customer: Customer) => !customer.isArchived))
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

  const fetchTags = async () => {
    try {
      const data = await apiClient.get('/api/tags')
      
      if (Array.isArray(data)) {
        setAvailableTags(data)
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error)
    }
  }

  const assignTag = async (customerId: string, tagId: string) => {
    try {
      await apiClient.post('/api/tags/assign', {
        tagId,
        customerIds: [customerId],
        action: 'assign'
      })
      fetchCustomers()
    } catch (error) {
      console.error('Failed to assign tag:', error)
    }
  }

  const removeTag = async (customerId: string, tagId: string) => {
    try {
      await apiClient.post('/api/tags/assign', {
        tagId,
        customerIds: [customerId],
        action: 'remove'
      })
      fetchCustomers()
    } catch (error) {
      console.error('Failed to remove tag:', error)
    }
  }

  const addCustomer = async (customerData: Partial<Customer>) => {
    try {
      await apiClient.post('/api/customers', customerData)
      fetchCustomers()
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to add customer:', error)
    }
  }

  const handleEditCustomer = (customer: Customer) => {
    router.push(`/customers/edit/${customer.id}`)
  }

  const archiveCustomer = async (customerId: string) => {
    try {
      const customer = customers.find(c => c.id === customerId)
      if (!customer) return

      await apiClient.put(`/api/customers/${customerId}`, { 
        ...customer, 
        isArchived: true 
      })
      
      setCustomers(customers.filter(c => c.id !== customerId))
    } catch (error) {
      console.error('Failed to archive customer:', error)
    }
  }

  const filteredAndSortedCustomers = customers
    .filter(customer => {
      const searchLower = searchTerm.toLowerCase()
      return searchTerm === '' || 
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.phone?.includes(searchTerm) ||
        customer.company?.toLowerCase().includes(searchLower) ||
        customer.gstin?.toLowerCase().includes(searchLower)
    })
    .sort((a, b) => {
      let aValue: string, bValue: string
      
      switch (sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'company':
          aValue = a.company || ''
          bValue = b.company || ''
          break
        case 'created':
          aValue = a.createdAt
          bValue = b.createdAt
          break
        default:
          aValue = a.name
          bValue = b.name
      }
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-700">Loading customers...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <LayoutWithVerticalNav currentPage="customers">

        <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          {/* Mobile-first Header */}
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
                <p className="text-gray-600">Total: {filteredAndSortedCustomers.length} customers</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                >
                  <span className="mr-2">🔍</span>
                  <span className="hidden sm:inline">Filters</span>
                  <span className="sm:hidden">Search</span>
                </button>
                
                <div className="flex bg-white border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-l-md ${
                      viewMode === 'grid' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="hidden sm:inline">Grid</span>
                    <span className="sm:hidden">⊞</span>
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-r-md border-l ${
                      viewMode === 'table' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-50 border-gray-300'
                    }`}
                  >
                    <span className="hidden sm:inline">Table</span>
                    <span className="sm:hidden">☰</span>
                  </button>
                </div>
                
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center"
                >
                  <span className="mr-2">+</span>
                  <span className="hidden sm:inline">Add Customer</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile-optimized Search and Filters */}
          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Name, email, phone, company, GSTIN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'name' | 'company' | 'created')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="name">Name</option>
                      <option value="company">Company</option>
                      <option value="created">Date Added</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="asc">A-Z / Oldest</option>
                      <option value="desc">Z-A / Newest</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSortBy('name')
                      setSortOrder('asc')
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300 text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Grid View - Mobile Optimized */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredAndSortedCustomers.map(customer => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onEdit={() => handleEditCustomer(customer)}
                  onArchive={archiveCustomer}
                  onViewProfile={() => router.push(`/customers/view/${customer.id}`)}
                />
              ))}
            </div>
          )}

          {/* Table View - Mobile Responsive */}
          {viewMode === 'table' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
              <CustomersTable 
                customers={filteredAndSortedCustomers}
                onEdit={(customer) => handleEditCustomer(customer)}
                onArchive={archiveCustomer}
                onViewProfile={(customer) => router.push(`/customers/view/${customer.id}`)}
              />
            </div>
          )}

          {/* No Results */}
          {filteredAndSortedCustomers.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-4xl text-gray-400 mb-4">🤝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first customer'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                >
                  Add First Customer
                </button>
              )}
            </div>
          )}
        </main>

        {/* Modals */}
        {showAddForm && (
          <AddCustomerModal 
            onAdd={addCustomer} 
            onClose={() => setShowAddForm(false)} 
          />
        )}


      </LayoutWithVerticalNav>
    </AuthGuard>
  )
}

// Mobile-optimized Customer Card
function CustomerCard({ customer, onEdit, onArchive, onViewProfile }: {
  customer: Customer
  onEdit: () => void
  onArchive: (id: string) => void
  onViewProfile: () => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">{customer.name}</h3>
            {customer.company && (
              <p className="text-sm text-gray-600 truncate">{customer.company}</p>
            )}
          </div>
          <div className="relative ml-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 hover:text-gray-600 p-2 -m-2"
            >
              ⋮
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
                <button
                  onClick={() => { onViewProfile(); setShowMenu(false) }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Profile
                </button>
                <button
                  onClick={() => { onEdit(); setShowMenu(false) }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => { onArchive(customer.id); setShowMenu(false) }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                >
                  Archive
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📧</span>
            <span className="truncate">{customer.email}</span>
          </div>
          
          {customer.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">📞</span>
              <span>{customer.phone}</span>
            </div>
          )}
          
          {customer.gstin && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">🏛️</span>
              <span className="truncate">{customer.gstin}</span>
            </div>
          )}
          
          {customer.tags && customer.tags.length > 0 && (
            <div className="mt-3">
              <TagComponent 
                tags={customer.tags}
                compact={true}
                maxDisplay={3}
              />
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Added {new Date(customer.createdAt).toLocaleDateString()}</span>
            <button
              onClick={onViewProfile}
              className="text-blue-600 hover:text-blue-800 p-1"
              title="View Customer Profile"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mobile-responsive Table
function CustomersTable({ customers, onEdit, onArchive, onViewProfile }: {
  customers: Customer[]
  onEdit: (customer: Customer) => void
  onArchive: (id: string) => void
  onViewProfile: (customer: Customer) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              GSTIN
            </th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-gray-50">
              <td className="px-3 sm:px-6 py-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                  <div className="text-sm text-gray-500 sm:hidden">
                    {customer.email}
                    {customer.phone && <div>{customer.phone}</div>}
                  </div>
                  {customer.company && (
                    <div className="text-sm text-gray-500 md:hidden">{customer.company}</div>
                  )}
                </div>
              </td>
              <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  <div>{customer.email}</div>
                  {customer.phone && <div>{customer.phone}</div>}
                </div>
              </td>
              <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {customer.company || '-'}
              </td>
              <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {customer.gstin || '-'}
              </td>
              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => onViewProfile(customer)}
                    className="text-blue-600 hover:text-blue-900 p-1"
                    title="View Customer Profile"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onEdit(customer)}
                    className="text-indigo-600 hover:text-indigo-900 p-1"
                    title="Edit Customer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onArchive(customer.id)}
                    className="text-red-600 hover:text-red-900 text-xs sm:text-sm"
                  >
                    Archive
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Enhanced Add Customer Modal - Formik Version
function AddCustomerModal({ onAdd, onClose }: { onAdd: (data: any) => void, onClose: () => void }) {
  const [error, setError] = useState('')
  const [sameAddress, setSameAddress] = useState(false)

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string().nullable(),
    company: Yup.string().nullable(),
    billingAddress: Yup.string().nullable(),
    shippingAddress: Yup.string().nullable(),
    gstin: Yup.string().nullable(),
    notes: Yup.string().nullable(),
  })

  const initialValues = {
    name: '',
    email: '',
    phone: '',
    company: '',
    billingAddress: '',
    shippingAddress: '',
    gstin: '',
    notes: '',
  }

  const handleSubmit = async (values: typeof initialValues, { setSubmitting }: any) => {
    try {
      setError('')
      const submitData = {
        ...values,
        shippingAddress: sameAddress ? values.billingAddress : values.shippingAddress
      }
      await onAdd(submitData)
    } catch (err: any) {
      setError(err.message || 'Failed to add customer')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Add New Customer</h2>
          
          <FormWrapper
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, setFieldValue }: any) => (
              <>
                <FormErrorMessage message={error} />
                
                {/* Basic Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <FormField name="name" label="Name" required />
                  </div>
                  
                  <FormField name="email" label="Email" type="email" required />
                  <FormField name="phone" label="Phone" type="tel" />
                  <FormField name="company" label="Company" />
                  <FormField name="gstin" label="GSTIN" />
                </div>
                
                {/* Addresses */}
                <div className="space-y-4">
                  <FormField name="billingAddress" label="Billing Address" as="textarea" rows={3} />
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sameAddress"
                      checked={sameAddress}
                      onChange={(e) => {
                        setSameAddress(e.target.checked)
                        if (e.target.checked) {
                          setFieldValue('shippingAddress', values.billingAddress)
                        }
                      }}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sameAddress" className="ml-2 text-sm text-gray-700">
                      Shipping address same as billing
                    </label>
                  </div>
                  
                  {!sameAddress && (
                    <FormField name="shippingAddress" label="Shipping Address" as="textarea" rows={3} />
                  )}
                </div>
                
                <FormField name="notes" label="Notes" as="textarea" rows={3} />
                
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <FormButton
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                  >
                    Cancel
                  </FormButton>
                  <FormButton
                    type="submit"
                    variant="success"
                    loading={isSubmitting}
                  >
                    Add Customer
                  </FormButton>
                </div>
              </>
            )}
          </FormWrapper>
        </div>
      </div>
    </div>
  )
}


