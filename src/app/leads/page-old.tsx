'use client'

import { useState, useEffect } from 'react'
import { LeadStatus } from '@prisma/client'
import AuthGuard from '@/components/AuthGuard'
import NavBar from '@/components/NavBar'

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
}

const statusColumns = [
  { status: 'NEW' as LeadStatus, title: 'New Leads', color: 'bg-blue-100 border-blue-300' },
  { status: 'CONTACTED' as LeadStatus, title: 'Contacted', color: 'bg-yellow-100 border-yellow-300' },
  { status: 'QUALIFIED' as LeadStatus, title: 'Qualified', color: 'bg-purple-100 border-purple-300' },
  { status: 'CONVERTED' as LeadStatus, title: 'Converted', color: 'bg-green-100 border-green-300' },
  { status: 'LOST' as LeadStatus, title: 'Lost', color: 'bg-red-100 border-red-300' },
]

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads')
      const data = await response.json()
      
      if (response.ok && Array.isArray(data)) {
        setLeads(data)
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

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    try {
      const lead = leads.find(l => l.id === leadId)
      if (!lead) return

      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lead, status: newStatus }),
      })

      if (response.ok) {
        const updatedLead = await response.json()
        setLeads(leads.map(l => l.id === leadId ? updatedLead : l))
      }
    } catch (error) {
      console.error('Failed to update lead:', error)
    }
  }

  const addLead = async (leadData: Partial<Lead>) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      })

      if (response.ok) {
        const newLead = await response.json()
        setLeads([newLead, ...leads])
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Failed to add lead:', error)
    }
  }

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter(lead => lead.status === status)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar currentPage="leads" />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add New Lead
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {statusColumns.map(column => (
              <div key={column.status} className={`${column.color} rounded-lg p-4 min-h-96`}>
                <h3 className="font-semibold text-gray-800 mb-4">
                  {column.title} ({getLeadsByStatus(column.status).length})
                </h3>
                
                <div className="space-y-3">
                  {getLeadsByStatus(column.status).map(lead => (
                    <div
                      key={lead.id}
                      className="bg-white p-3 rounded-md shadow-sm border cursor-pointer hover:shadow-md"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('leadId', lead.id)
                        e.dataTransfer.setData('sourceStatus', lead.status)
                      }}
                    >
                      <h4 className="font-medium text-gray-900">{lead.name}</h4>
                      {lead.company && (
                        <p className="text-sm text-gray-600">{lead.company}</p>
                      )}
                      {lead.email && (
                        <p className="text-sm text-gray-500">{lead.email}</p>
                      )}
                      {lead.phone && (
                        <p className="text-sm text-gray-500">{lead.phone}</p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {statusColumns
                          .filter(col => col.status !== lead.status)
                          .map(col => (
                            <button
                              key={col.status}
                              onClick={() => updateLeadStatus(lead.id, col.status)}
                              className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              {col.title}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showAddForm && (
        <AddLeadModal onAdd={addLead} onClose={() => setShowAddForm(false)} />
      )}
    </div>
    </AuthGuard>
  )
}

function AddLeadModal({ onAdd, onClose }: { onAdd: (data: any) => void, onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Lead</h2>
        
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
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
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
            <label className="block text-sm font-medium text-gray-700">Source</label>
            <input
              type="text"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
              rows={3}
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}