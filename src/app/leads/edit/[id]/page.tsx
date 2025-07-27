'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { LeadStatus } from '@prisma/client'
import AuthGuard from '@/components/AuthGuard'
import NavBar from '@/components/NavBar'
import apiClient from '@/lib/api-client'

interface Lead {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  status: LeadStatus
  source: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  convertedAt: string | null
  isArchived: boolean
  assignedTo?: {
    id: string
    name: string
    email: string
  }
}

const statusOptions = [
  { value: 'NEW', label: 'New', color: 'bg-blue-100 text-blue-800' },
  { value: 'CONTACTED', label: 'Contacted', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'QUALIFIED', label: 'Qualified', color: 'bg-purple-100 text-purple-800' },
  { value: 'CONVERTED', label: 'Converted', color: 'bg-green-100 text-green-800' },
  { value: 'LOST', label: 'Lost', color: 'bg-red-100 text-red-800' },
]

const sourceOptions = [
  'Website',
  'Referral',
  'Cold Call',
  'Social Media',
  'Trade Show',
  'Advertisement',
  'Other'
]

export default function EditLeadPage() {
  const params = useParams()
  const router = useRouter()
  const leadId = params.id as string
  
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'NEW' as LeadStatus,
    source: '',
    notes: '',
  })

  useEffect(() => {
    fetchLead()
  }, [leadId])

  const fetchLead = async () => {
    try {
      const data = await apiClient.get(`/api/leads/${leadId}`)
      setLead(data)
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        company: data.company || '',
        status: data.status,
        source: data.source || '',
        notes: data.notes || '',
      })
    } catch (error) {
      console.error('Failed to fetch lead:', error)
      router.push('/leads')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      await apiClient.put(`/api/leads/${leadId}`, formData)
      router.push('/leads')
    } catch (error) {
      console.error('Failed to update lead:', error)
      alert('Failed to update lead. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/leads')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-700">Loading lead...</p>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-700">Lead not found</p>
          <button
            onClick={() => router.push('/leads')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Leads
          </button>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="leads" />

        <main className="max-w-4xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            {/* Mobile-first Header */}
            <div className="flex flex-col space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Lead</h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    Update lead information and status
                  </p>
                </div>
                
                {/* Current Status Badge */}
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Current Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusOptions.find(s => s.value === lead.status)?.color || 'bg-gray-100 text-gray-800'
                  }`}>
                    {statusOptions.find(s => s.value === lead.status)?.label || lead.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <div className="bg-white shadow rounded-lg border border-gray-200">
              <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left Column */}
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter lead name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter company name"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as LeadStatus })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Source
                      </label>
                      <select
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Source</option>
                        {sourceOptions.map(source => (
                          <option key={source} value={source}>
                            {source}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter any notes or additional information"
                      />
                    </div>

                    {/* Lead Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Lead Information</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Created: {new Date(lead.createdAt).toLocaleDateString()}</p>
                        <p>Updated: {new Date(lead.updatedAt).toLocaleDateString()}</p>
                        {lead.convertedAt && (
                          <p>Converted: {new Date(lead.convertedAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-6 sm:mt-8 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="w-full sm:w-auto px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </span>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}