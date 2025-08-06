'use client'

import { useState, useEffect } from 'react'
import { AuthGuard, NavBar } from '@/shared/components'
import ActivityTimeline from '@/components/ActivityTimeline'
import TaskSection from '@/components/TaskSection'
import TagComponent from '@/components/TagComponent'
import { apiClient } from '@/lib/api-client'
import { 
  CustomerForm, 
  CustomersList, 
  useCustomers, 
  customersService,
  Customer, 
  Tag 
} from '@/modules/customers'

export default function EnhancedCustomersPage() {
  const { customers, loading, addCustomer, refreshCustomers } = useCustomers()
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'created'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchTags()
  }, [])


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
      refreshCustomers()
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
      refreshCustomers()
    } catch (error) {
      console.error('Failed to remove tag:', error)
    }
  }

  const handleAddCustomer = async (customerData: any) => {
    try {
      const newCustomer = await customersService.create(customerData)
      addCustomer(newCustomer)
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to add customer:', error)
      throw error
    }
  }

  const handleAddTag = async (customerId: string, tagId: string) => {
    try {
      await customersService.addTag(customerId, tagId)
      refreshCustomers()
    } catch (error) {
      console.error('Failed to add tag:', error)
    }
  }

  const handleRemoveTag = async (customerId: string, tagId: string) => {
    try {
      await customersService.removeTag(customerId, tagId)
      refreshCustomers()
    } catch (error) {
      console.error('Failed to remove tag:', error)
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
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="customers" />

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

          {/* Customers List */}
          <CustomersList
            customers={filteredAndSortedCustomers}
            availableTags={availableTags}
            viewMode={viewMode}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
          />

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
          <CustomerForm
            onSubmit={handleAddCustomer}
            onClose={() => setShowAddForm(false)}
          />
        )}


      </div>
    </AuthGuard>
  )
}


