'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AuthGuard } from '@/shared/components'
import { NavBar } from '@/shared/components'
import ActivityTimeline from '@/components/ActivityTimeline'
import TaskSection from '@/components/TaskSection'
import TagComponent from '@/components/TagComponent'
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
  lead?: {
    id: string
    name: string
    status: string
  } | null
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

export default function CustomerViewPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'tasks'>('overview')

  useEffect(() => {
    fetchCustomer()
    fetchTags()
  }, [customerId])

  const fetchCustomer = async () => {
    try {
      const data = await apiClient.get(`/api/customers/${customerId}`)
      setCustomer(data)
    } catch (error) {
      console.error('Failed to fetch customer:', error)
      router.push('/customers')
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
      fetchCustomer()
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
      fetchCustomer()
    } catch (error) {
      console.error('Failed to remove tag:', error)
    }
  }

  const handleEdit = () => {
    router.push(`/customers/edit/${customerId}`)
  }

  const handleBack = () => {
    router.push('/customers')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-700">Loading customer...</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-4xl text-gray-400 mb-4">🤷‍♂️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Customer not found</h3>
          <p className="text-gray-500 mb-4">The customer you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={handleBack}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Back to Customers
          </button>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="customers" />

        <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-6">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <button 
                onClick={handleBack}
                className="hover:text-gray-700 transition-colors"
              >
                Customers
              </button>
              <span className="mx-2">›</span>
              <span className="text-gray-900 font-medium">{customer.name}</span>
            </div>

            {/* Customer Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl font-bold">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Customer Info */}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-gray-900 truncate">{customer.name}</h1>
                    {customer.company && (
                      <p className="text-lg text-gray-600 truncate">{customer.company}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="mr-1">📧</span>
                        <a href={`mailto:${customer.email}`} className="text-blue-600 hover:text-blue-800 truncate">
                          {customer.email}
                        </a>
                      </div>
                      {customer.phone && (
                        <div className="flex items-center">
                          <span className="mr-1">📱</span>
                          <a href={`tel:${customer.phone}`} className="text-blue-600 hover:text-blue-800">
                            {customer.phone}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="mr-1">📅</span>
                        <span>Added {new Date(customer.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">✏️</span>
                    Edit Customer
                  </button>
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">←</span>
                    Back
                  </button>
                </div>
              </div>

              {/* Customer Tags */}
              {customer.tags && customer.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <TagComponent 
                    tags={customer.tags}
                    availableTags={availableTags}
                    editable={true}
                    onTagAdd={(tagId) => assignTag(customer.id, tagId)}
                    onTagRemove={(tagId) => removeTag(customer.id, tagId)}
                  />
                </div>
              )}

              {/* Lead Conversion Info */}
              {customer.lead && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="text-green-600">🎯</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          Converted from Lead
                        </p>
                        <p className="text-sm text-green-600">
                          Lead: {customer.lead.name} (Status: {customer.lead.status})
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📋 Overview
                </button>
                <button
                  onClick={() => setActiveTab('activities')}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'activities'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📈 Activities
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'tasks'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ✅ Tasks
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">👤</span>
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <InfoField label="Full Name" value={customer.name} />
                  <InfoField label="Email Address" value={customer.email} link={`mailto:${customer.email}`} />
                  {customer.phone && (
                    <InfoField label="Phone Number" value={customer.phone} link={`tel:${customer.phone}`} />
                  )}
                  {customer.company && (
                    <InfoField label="Company" value={customer.company} />
                  )}
                  {customer.gstin && (
                    <InfoField label="GSTIN" value={customer.gstin} />
                  )}
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🏠</span>
                  Address Information
                </h3>
                <div className="space-y-4">
                  {customer.billingAddress && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-gray-900 whitespace-pre-line text-sm">{customer.billingAddress}</p>
                      </div>
                    </div>
                  )}
                  {customer.shippingAddress && customer.shippingAddress !== customer.billingAddress && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-gray-900 whitespace-pre-line text-sm">{customer.shippingAddress}</p>
                      </div>
                    </div>
                  )}
                  {!customer.billingAddress && !customer.shippingAddress && (
                    <div className="text-center py-8 text-gray-500">
                      <span className="text-3xl mb-2 block">📭</span>
                      <p>No address information available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Section */}
              {customer.notes && (
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📝</span>
                    Notes
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-900 whitespace-pre-line">{customer.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <ActivityTimeline 
                customerId={customer.id}
                maxItems={20}
                compact={false}
              />
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <TaskSection 
                customerId={customer.id}
                maxItems={20}
                compact={false}
              />
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}

// Reusable Info Field Component
function InfoField({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {link ? (
        <a href={link} className="text-blue-600 hover:text-blue-800 transition-colors">
          {value}
        </a>
      ) : (
        <p className="text-gray-900">{value}</p>
      )}
    </div>
  )
}