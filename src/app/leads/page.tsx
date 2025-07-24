'use client'

import { useState, useEffect } from 'react'
import { LeadStatus } from '@prisma/client'
import AuthGuard from '@/components/AuthGuard'
import NavBar from '@/components/NavBar'
import TaskSection from '@/components/TaskSection'
import TagComponent from '@/components/TagComponent'
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
  const [leads, setLeads] = useState<Lead[]>([])
  const [availableTags, setAvailableTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
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

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Header with controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
                <p className="text-gray-600">Total: {filteredLeads.length} leads</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <span className="mr-2">🔍</span>
                  Filters
                </button>
                
                <div className="flex bg-white border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                      viewMode === 'kanban' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Kanban
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-md border-l ${
                      viewMode === 'table' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-50 border-gray-300'
                    }`}
                  >
                    Table
                  </button>
                </div>
                
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {statusColumns.map(column => (
                  <div key={column.status} className={`${column.color} rounded-lg p-4 min-h-96 border-2`}>
                    <h3 className={`font-semibold mb-4 ${column.textColor}`}>
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
                          onEdit={() => setSelectedLead(lead)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
                <LeadsTable 
                  leads={filteredLeads}
                  onStatusChange={updateLeadStatus}
                  onConvert={convertToCustomer}
                  onArchive={archiveLead}
                  onEdit={(lead) => setSelectedLead(lead)}
                />
              </div>
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

        {selectedLead && (
          <EditLeadModal
            lead={selectedLead}
            onSave={(data) => {
              fetchLeads()
              setSelectedLead(null)
            }}
            onClose={() => setSelectedLead(null)}
            availableTags={availableTags}
            onTagAdd={(leadId, tagId) => assignTag(leadId, tagId)}
            onTagRemove={(leadId, tagId) => removeTag(leadId, tagId)}
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
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
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
                  className="text-blue-600 hover:text-blue-900"
                >
                  Edit
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

// Add Lead Modal (enhanced)
function AddLeadModal({ onAdd, onClose }: { onAdd: (data: any) => void, onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    notes: '',
    assignedToId: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const newLead = await apiClient.post('/api/leads', formData)
      onAdd(newLead)
    } catch (error) {
      console.error('Failed to create lead:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-900">Add New Lead</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Source</label>
            <select
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Source</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Cold Call">Cold Call</option>
              <option value="Social Media">Social Media</option>
              <option value="Trade Show">Trade Show</option>
              <option value="Advertisement">Advertisement</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Lead Profile Modal
function EditLeadModal({ lead, onSave, onClose, availableTags, onTagAdd, onTagRemove }: { 
  lead: Lead
  onSave: (data: any) => void
  onClose: () => void
  availableTags: any[]
  onTagAdd: (leadId: string, tagId: string) => void
  onTagRemove: (leadId: string, tagId: string) => void
}) {
  const statusColors = {
    NEW: 'text-blue-600 bg-blue-100',
    CONTACTED: 'text-yellow-600 bg-yellow-100',
    QUALIFIED: 'text-purple-600 bg-purple-100',
    CONVERTED: 'text-green-600 bg-green-100',
    LOST: 'text-red-600 bg-red-100'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{lead.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[lead.status]}`}>
                  {lead.status}
                </span>
                {lead.company && (
                  <span className="text-sm text-gray-600">{lead.company}</span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Lead Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3 mt-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900">{lead.name}</p>
                  </div>
                  
                  {lead.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{lead.email}</p>
                    </div>
                  )}
                  
                  {lead.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-gray-900">{lead.phone}</p>
                    </div>
                  )}
                  
                  {lead.company && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Company</label>
                      <p className="text-gray-900">{lead.company}</p>
                    </div>
                  )}
                  
                  {lead.source && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Source</label>
                      <p className="text-gray-900">{lead.source}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p className="text-gray-900">{lead.status}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="text-gray-900">{new Date(lead.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  {lead.convertedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Converted</label>
                      <p className="text-gray-900">{new Date(lead.convertedAt).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {lead.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Notes</h3>
                  <div className="bg-gray-50 p-4 rounded-lg mt-2">
                    <p className="text-gray-900 whitespace-pre-line">{lead.notes}</p>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Tags</h3>
                <div className="mt-2">
                  <TagComponent 
                    tags={lead.tags || []}
                    availableTags={availableTags}
                    editable={true}
                    onTagAdd={(tagId) => onTagAdd(lead.id, tagId)}
                    onTagRemove={(tagId) => onTagRemove(lead.id, tagId)}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <TaskSection 
                leadId={lead.id}
                maxItems={5}
                compact={true}
              />
            </div>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}