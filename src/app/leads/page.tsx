'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LeadStatus } from '@prisma/client'
import * as Yup from 'yup'
import { AuthGuard, NavBar } from '@/shared/components'
import TaskSection from '@/components/TaskSection'
import TagComponent from '@/components/TagComponent'
import { FormWrapper, FormField, FormButton, FormErrorMessage } from '@/shared/components'
import { apiClient } from '@/shared/services'

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
  tags?: Array<{
    id: string
    name: string
    color: string
    description?: string | null
  }>
  activities?: Array<{
    id: string
    type: string
    title: string
    createdAt: string
  }>
}

const statusColumns = [
  { status: 'NEW' as LeadStatus, title: 'New Leads', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-900' },
  { status: 'CONTACTED' as LeadStatus, title: 'Contacted', color: 'bg-yellow-50 border-yellow-200', textColor: 'text-yellow-900' },
  { status: 'QUALIFIED' as LeadStatus, title: 'Qualified', color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-900' },
  { status: 'CONVERTED' as LeadStatus, title: 'Converted', color: 'bg-green-50 border-green-200', textColor: 'text-green-900' },
  { status: 'LOST' as LeadStatus, title: 'Lost', color: 'bg-red-50 border-red-200', textColor: 'text-red-900' },
]

export default function EnhancedLeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [availableTags, setAvailableTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'ALL'>('ALL')
  const [sourceFilter, setSourceFilter] = useState<string>('ALL')

  useEffect(() => {
    fetchLeads()
    fetchTags()
  }, [])

  const fetchLeads = async () => {
    try {
      const data = await apiClient.get('/api/leads')
      
      if (Array.isArray(data)) {
        setLeads(data.filter((lead: Lead) => !lead.isArchived))
      } else {
        console.error('API Error:', data)
        setLeads([])
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
      setLeads([])
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

  const assignTag = async (leadId: string, tagId: string) => {
    try {
      await apiClient.post('/api/tags/assign', {
        tagId,
        leadIds: [leadId],
        action: 'assign'
      })
      fetchLeads()
    } catch (error) {
      console.error('Failed to assign tag:', error)
    }
  }

  const removeTag = async (leadId: string, tagId: string) => {
    try {
      await apiClient.post('/api/tags/assign', {
        tagId,
        leadIds: [leadId],
        action: 'remove'
      })
      fetchLeads()
    } catch (error) {
      console.error('Failed to remove tag:', error)
    }
  }

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const lead = leads.find(l => l.id === leadId)
      if (!lead) return

      const updatedLead = await apiClient.put(`/api/leads/${leadId}`, { 
        ...lead, 
        status: newStatus 
      })
      setLeads(leads.map(l => l.id === leadId ? updatedLead : l))
    } catch (error) {
      console.error('Failed to update lead:', error)
    }
  }

  const convertToCustomer = async (leadId: string) => {
    try {
      const lead = leads.find(l => l.id === leadId)
      if (!lead) return

      // Create customer from lead data
      await apiClient.post('/api/customers', {
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        notes: lead.notes,
        leadId: lead.id,
      })

      // Update lead status to converted
      await updateLeadStatus(leadId, 'CONVERTED')
      alert('Lead successfully converted to customer!')
    } catch (error) {
      console.error('Failed to convert lead:', error)
    }
  }

  const archiveLead = async (leadId: string) => {
    try {
      const lead = leads.find(l => l.id === leadId)
      if (!lead) return

      await apiClient.put(`/api/leads/${leadId}`, { 
        ...lead, 
        isArchived: true 
      })
      
      setLeads(leads.filter(l => l.id !== leadId))
    } catch (error) {
      console.error('Failed to archive lead:', error)
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter
    const matchesSource = sourceFilter === 'ALL' || lead.source === sourceFilter
    
    return matchesSearch && matchesStatus && matchesSource
  })

  const getLeadsByStatus = (status: LeadStatus) => {
    return filteredLeads.filter(lead => lead.status === status)
  }

  const uniqueSources = Array.from(new Set(leads.map(l => l.source).filter(Boolean)))

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-700">Loading leads...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="leads" />

        <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            {/* Mobile-first Header */}
            <div className="flex flex-col space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Leads Management</h1>
                  <p className="text-sm sm:text-base text-gray-600">Total: {filteredLeads.length} leads</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center min-h-[44px] transition-colors"
                  >
                    <span className="mr-2">🔍</span>
                    <span className="hidden sm:inline">Filters</span>
                    <span className="sm:hidden">Filter</span>
                  </button>
                  
                  <div className="flex bg-white border border-gray-300 rounded-md">
                    <button
                      onClick={() => setViewMode('kanban')}
                      className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-l-md min-h-[44px] transition-colors ${
                        viewMode === 'kanban' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="hidden sm:inline">Kanban</span>
                      <span className="sm:hidden">📋</span>
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-r-md border-l min-h-[44px] transition-colors ${
                        viewMode === 'table' 
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-700 hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      <span className="hidden sm:inline">Table</span>
                      <span className="sm:hidden">📊</span>
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center min-h-[44px] transition-colors"
                >
                  <span className="mr-2">+</span>
                  Add New Lead
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            {showFilters && (
              <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                    <input
                      type="text"
                      placeholder="Name, email, phone, company..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'ALL')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ALL">All Statuses</option>
                      {statusColumns.map(col => (
                        <option key={col.status} value={col.status}>{col.title}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                    <select
                      value={sourceFilter}
                      onChange={(e) => setSourceFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ALL">All Sources</option>
                      {uniqueSources.map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('ALL')
                        setSourceFilter('ALL')
                      }}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Kanban View */}
            {viewMode === 'kanban' && (
              <>
                {/* Mobile: Stack columns vertically */}
                <div className="block md:hidden space-y-6">
                  {statusColumns.map(column => (
                    <div key={column.status} className={`${column.color} rounded-lg p-4 border-2`}>
                      <h3 className={`font-semibold mb-4 text-sm sm:text-base ${column.textColor}`}>
                        {column.title} ({getLeadsByStatus(column.status).length})
                      </h3>
                      
                      <div className="space-y-3">
                        {getLeadsByStatus(column.status).map(lead => (
                          <LeadCard
                            key={lead.id}
                            lead={lead}
                            onStatusChange={updateLeadStatus}
                            onConvert={convertToCustomer}
                            onArchive={archiveLead}
                            onEdit={() => router.push(`/leads/edit/${lead.id}`)}
                          />
                        ))}
                        {getLeadsByStatus(column.status).length === 0 && (
                          <div className="text-center py-6 text-gray-500 text-sm">
                            No {column.title.toLowerCase()} leads
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Desktop: Horizontal scroll for narrow screens, grid for large */}
                <div className="hidden md:block">
                  <div className="grid grid-cols-5 gap-4 lg:gap-6">
                    {statusColumns.map(column => (
                      <div key={column.status} className={`${column.color} rounded-lg p-3 lg:p-4 min-h-96 border-2`}>
                        <h3 className={`font-semibold mb-4 text-sm lg:text-base ${column.textColor}`}>
                          {column.title} ({getLeadsByStatus(column.status).length})
                        </h3>
                        
                        <div className="space-y-3">
                          {getLeadsByStatus(column.status).map(lead => (
                            <LeadCard
                              key={lead.id}
                              lead={lead}
                              onStatusChange={updateLeadStatus}
                              onConvert={convertToCustomer}
                              onArchive={archiveLead}
                              onEdit={() => router.push(`/leads/edit/${lead.id}`)}
                            />
                          ))}
                          {getLeadsByStatus(column.status).length === 0 && (
                            <div className="text-center py-6 text-gray-500 text-sm">
                              No {column.title.toLowerCase()} leads
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <>
                {/* Mobile: Card-based list view */}
                <div className="block lg:hidden space-y-4">
                  {filteredLeads.map(lead => (
                    <div key={lead.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-gray-900 truncate">{lead.name}</h3>
                          <p className="text-sm text-gray-500">{lead.company}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          lead.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                          lead.status === 'CONTACTED' ? 'bg-yellow-100 text-yellow-800' :
                          lead.status === 'QUALIFIED' ? 'bg-purple-100 text-purple-800' :
                          lead.status === 'CONVERTED' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {lead.status}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        {lead.email && (
                          <div className="flex items-center">
                            <span className="mr-2">📧</span>
                            <a href={`mailto:${lead.email}`} className="text-blue-600 hover:text-blue-800 truncate">
                              {lead.email}
                            </a>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center">
                            <span className="mr-2">📱</span>
                            <a href={`tel:${lead.phone}`} className="text-blue-600 hover:text-blue-800">
                              {lead.phone}
                            </a>
                          </div>
                        )}
                        {lead.source && (
                          <div className="flex items-center">
                            <span className="mr-2">🎯</span>
                            <span>{lead.source}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <button
                          onClick={() => router.push(`/leads/edit/${lead.id}`)}
                          className="p-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="Edit Lead"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {lead.status !== 'CONVERTED' && (
                          <button
                            onClick={() => convertToCustomer(lead.id)}
                            className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 min-h-[36px] flex items-center"
                          >
                            🔄 Convert
                          </button>
                        )}
                        <button
                          onClick={() => archiveLead(lead.id)}
                          className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 min-h-[36px] flex items-center"
                        >
                          🗄️ Archive
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {filteredLeads.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg mb-2">No leads found</p>
                      <p className="text-sm">Try adjusting your filters or add a new lead</p>
                    </div>
                  )}
                </div>

                {/* Desktop: Traditional table view */}
                <div className="hidden lg:block bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                  <LeadsTable 
                    leads={filteredLeads}
                    onStatusChange={updateLeadStatus}
                    onConvert={convertToCustomer}
                    onArchive={archiveLead}
                    onEdit={(lead) => router.push(`/leads/edit/${lead.id}`)}
                  />
                </div>
              </>
            )}
          </div>
        </main>

        {/* Modals */}
        {showAddForm && (
          <AddLeadModal 
            onAdd={(data) => {
              fetchLeads()
              setShowAddForm(false)
            }} 
            onClose={() => setShowAddForm(false)} 
          />
        )}
      </div>
    </AuthGuard>
  )
}

// Lead Card Component for Kanban
function LeadCard({ lead, onStatusChange, onConvert, onArchive, onEdit }: {
  lead: Lead
  onStatusChange: (id: string, status: LeadStatus) => void
  onConvert: (id: string) => void
  onArchive: (id: string) => void
  onEdit: () => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900 text-sm">{lead.name}</h4>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          ⋮
        </button>
      </div>
      
      {lead.company && (
        <p className="text-xs text-gray-600 mb-1">{lead.company}</p>
      )}
      
      {lead.email && (
        <p className="text-xs text-gray-500 mb-1">📧 {lead.email}</p>
      )}
      
      {lead.phone && (
        <p className="text-xs text-gray-500 mb-2">📞 {lead.phone}</p>
      )}
      
      {lead.source && (
        <div className="mb-2">
          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
            {lead.source}
          </span>
        </div>
      )}
      
      {lead.tags && lead.tags.length > 0 && (
        <div className="mb-2">
          <TagComponent 
            tags={lead.tags}
            compact={true}
            maxDisplay={2}
          />
        </div>
      )}
      
      <div className="text-xs text-gray-400">
        {new Date(lead.createdAt).toLocaleDateString()}
      </div>

      {/* Action Menu */}
      {showMenu && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
          <button
            onClick={() => { onEdit(); setShowMenu(false) }}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          {lead.status !== 'CONVERTED' && (
            <button
              onClick={() => { onConvert(lead.id); setShowMenu(false) }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Convert
            </button>
          )}
          <button
            onClick={() => { onArchive(lead.id); setShowMenu(false) }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
          >
            Archive
          </button>
        </div>
      )}
    </div>
  )
}

// Table View Component
function LeadsTable({ leads, onStatusChange, onConvert, onArchive, onEdit }: {
  leads: Lead[]
  onStatusChange: (id: string, status: LeadStatus) => void
  onConvert: (id: string) => void
  onArchive: (id: string) => void
  onEdit: (lead: Lead) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lead
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Source
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                  {lead.company && (
                    <div className="text-sm text-gray-500">{lead.company}</div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {lead.email && <div>📧 {lead.email}</div>}
                  {lead.phone && <div>📞 {lead.phone}</div>}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={lead.status}
                  onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusColumns.map(col => (
                    <option key={col.status} value={col.status}>{col.title}</option>
                  ))}
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {lead.source || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(lead.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  onClick={() => onEdit(lead)}
                  className="text-blue-600 hover:text-blue-900 p-1"
                  title="Edit Lead"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {lead.status !== 'CONVERTED' && (
                  <button
                    onClick={() => onConvert(lead.id)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Convert
                  </button>
                )}
                <button
                  onClick={() => onArchive(lead.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Archive
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {leads.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No leads found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

const leadValidationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .nullable(),
  phone: Yup.string()
    .nullable(),
  company: Yup.string()
    .nullable(),
  source: Yup.string()
    .nullable(),
  notes: Yup.string()
    .nullable(),
  assignedToId: Yup.string()
    .nullable()
})

interface LeadFormValues {
  name: string
  email: string
  phone: string
  company: string
  source: string
  notes: string
  assignedToId: string
}

// Add Lead Modal (enhanced)
function AddLeadModal({ onAdd, onClose }: { onAdd: (data: any) => void, onClose: () => void }) {
  const [error, setError] = useState('')
  
  const initialValues: LeadFormValues = {
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    notes: '',
    assignedToId: '',
  }

  const handleSubmit = async (values: LeadFormValues) => {
    setError('')
    
    try {
      const newLead = await apiClient.post('/api/leads', values)
      onAdd(newLead)
    } catch (error) {
      console.error('Failed to create lead:', error)
      setError('Failed to create lead. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Add New Lead</h2>
        
        <FormWrapper
          initialValues={initialValues}
          validationSchema={leadValidationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <>
              <FormErrorMessage message={error} />
              
              <FormField
                name="name"
                label="Name"
                type="text"
                required
                disabled={isSubmitting}
              />
              
              <FormField
                name="email"
                label="Email"
                type="email"
                disabled={isSubmitting}
              />
              
              <FormField
                name="phone"
                label="Phone"
                type="tel"
                disabled={isSubmitting}
              />
              
              <FormField
                name="company"
                label="Company"
                type="text"
                disabled={isSubmitting}
              />
              
              <FormField
                name="source"
                label="Source"
                as="select"
                disabled={isSubmitting}
              >
                <option value="">Select source</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Social Media">Social Media</option>
                <option value="Advertisement">Advertisement</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Other">Other</option>
              </FormField>
              
              <FormField
                name="notes"
                label="Notes"
                as="textarea"
                rows={3}
                disabled={isSubmitting}
              />
              
              <div className="flex justify-end space-x-3 pt-4">
                <FormButton
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </FormButton>
                <FormButton
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  Add Lead
                </FormButton>
              </div>
            </>
          )}
        </FormWrapper>
      </div>
    </div>
  )
}

