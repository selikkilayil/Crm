import { useState, useEffect } from 'react'
import { leadsService } from '../services'
import type { Lead, LeadFilters } from '../types'

export function useLeads(filters?: LeadFilters) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeads = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await leadsService.getAll(filters)
      setLeads(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [filters])

  const createLead = async (data: any) => {
    try {
      const newLead = await leadsService.create(data)
      setLeads(prev => [newLead, ...prev])
      return newLead
    } catch (err) {
      throw err
    }
  }

  const updateLead = async (id: string, data: any) => {
    try {
      const updatedLead = await leadsService.update(id, data)
      setLeads(prev => prev.map(lead => 
        lead.id === id ? updatedLead : lead
      ))
      return updatedLead
    } catch (err) {
      throw err
    }
  }

  const deleteLead = async (id: string) => {
    try {
      await leadsService.delete(id)
      setLeads(prev => prev.filter(lead => lead.id !== id))
    } catch (err) {
      throw err
    }
  }

  const updateLeadStatus = async (id: string, status: Lead['status']) => {
    try {
      const updatedLead = await leadsService.updateStatus(id, status)
      setLeads(prev => prev.map(lead => 
        lead.id === id ? updatedLead : lead
      ))
      return updatedLead
    } catch (err) {
      throw err
    }
  }

  const convertToCustomer = async (id: string) => {
    try {
      await leadsService.convertToCustomer(id)
      setLeads(prev => prev.filter(lead => lead.id !== id))
    } catch (err) {
      throw err
    }
  }

  return {
    leads,
    loading,
    error,
    refetch: fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    updateLeadStatus,
    convertToCustomer
  }
}