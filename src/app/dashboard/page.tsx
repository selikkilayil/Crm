'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AuthGuard from '@/components/AuthGuard'
import LayoutWithVerticalNav from '@/components/LayoutWithVerticalNav'
import apiClient from '@/lib/api-client'

interface Stats {
  totalLeads: number
  totalCustomers: number
  conversionRate: number
  leadsByStatus: Record<string, number>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    totalCustomers: 0,
    conversionRate: 0,
    leadsByStatus: {},
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [leadsData, customersData] = await Promise.all([
        apiClient.get('/api/leads').catch(() => []),
        apiClient.get('/api/customers').catch(() => [])
      ])
      
      const leads = Array.isArray(leadsData) ? leadsData : []
      const customers = Array.isArray(customersData) ? customersData : []
      
      const leadsByStatus = leads.reduce((acc: Record<string, number>, lead: any) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1
        return acc
      }, {})
      
      const convertedLeads = leadsByStatus['CONVERTED'] || 0
      const conversionRate = leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0
      
      setStats({
        totalLeads: leads.length,
        totalCustomers: customers.length,
        conversionRate: Math.round(conversionRate),
        leadsByStatus,
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setStats({
        totalLeads: 0,
        totalCustomers: 0,
        conversionRate: 0,
        leadsByStatus: {},
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <AuthGuard>
      <LayoutWithVerticalNav currentPage="home">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">👥</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Leads
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalLeads}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">🤝</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Customers
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.totalCustomers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">📈</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Conversion Rate
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.conversionRate}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="text-2xl">🎯</div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Leads
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {(stats.leadsByStatus['NEW'] || 0) + 
                         (stats.leadsByStatus['CONTACTED'] || 0) + 
                         (stats.leadsByStatus['QUALIFIED'] || 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Leads by Status</h3>
              <div className="space-y-3">
                {Object.entries(stats.leadsByStatus).map(([status, count]) => {
                  const statusColors: Record<string, string> = {
                    NEW: 'bg-blue-500',
                    CONTACTED: 'bg-yellow-500',
                    QUALIFIED: 'bg-purple-500',
                    CONVERTED: 'bg-green-500',
                    LOST: 'bg-red-500',
                  }
                  
                  const percentage = stats.totalLeads > 0 ? (count / stats.totalLeads) * 100 : 0
                  
                  return (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${statusColors[status]} mr-3`} />
                        <span className="text-sm text-gray-600">{status}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900 mr-2">{count}</span>
                        <span className="text-xs text-gray-500">({Math.round(percentage)}%)</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/leads"
                  className="block w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-3">👥</span>
                    <div>
                      <div className="font-medium text-blue-900">Manage Leads</div>
                      <div className="text-sm text-blue-600">View and update lead status</div>
                    </div>
                  </div>
                </Link>
                
                <Link
                  href="/customers"
                  className="block w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-green-600 mr-3">🤝</span>
                    <div>
                      <div className="font-medium text-green-900">View Customers</div>
                      <div className="text-sm text-green-600">Manage customer information</div>
                    </div>
                  </div>
                </Link>
                
                <div className="px-4 py-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-3">🏭</span>
                    <div>
                      <div className="font-medium text-gray-500">Production (Coming Soon)</div>
                      <div className="text-sm text-gray-400">Manage manufacturing orders</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </main>
      </LayoutWithVerticalNav>
    </AuthGuard>
  )
}