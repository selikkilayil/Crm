'use client'

import { useState, useEffect } from 'react'
import { ActivityType } from '@prisma/client'
import { useConfirm } from '@/lib/confirmation-context'
import { AuthGuard } from '@/shared/components'
import { NavBar } from '@/shared/components'
import apiClient from '@/shared/services'

interface Activity {
  id: string
  type: ActivityType
  title: string
  description: string | null
  scheduledAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  lead?: {
    id: string
    name: string
    company: string | null
  }
  customer?: {
    id: string
    name: string
    company: string | null
  }
}

const activityTypes = [
  { value: 'NOTE', label: 'Note', icon: '📝', color: 'bg-gray-100 text-gray-800' },
  { value: 'CALL', label: 'Call', icon: '📞', color: 'bg-blue-100 text-blue-800' },
  { value: 'EMAIL', label: 'Email', icon: '📧', color: 'bg-green-100 text-green-800' },
  { value: 'MEETING', label: 'Meeting', icon: '🤝', color: 'bg-purple-100 text-purple-800' },
  { value: 'TASK', label: 'Task', icon: '✅', color: 'bg-orange-100 text-orange-800' },
]

export default function ActivitiesPage() {
  const confirm = useConfirm()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filterType, setFilterType] = useState<ActivityType | 'ALL'>('ALL')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      const data = await apiClient.get('/api/activities')
      
      if (Array.isArray(data)) {
        setActivities(data)
      } else {
        console.error('API Error:', data)
        setActivities([])
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const addActivity = async (activityData: any) => {
    try {
      await apiClient.post('/api/activities', activityData)
      fetchActivities()
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to add activity:', error)
    }
  }

  const markAsCompleted = async (activityId: string) => {
    try {
      await apiClient.put(`/api/activities/${activityId}`, { 
        completedAt: new Date().toISOString() 
      })
      fetchActivities()
    } catch (error) {
      console.error('Failed to update activity:', error)
    }
  }

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity)
    setShowEditForm(true)
  }

  const updateActivity = async (activityData: any) => {
    try {
      if (!editingActivity) return
      
      await apiClient.put(`/api/activities/${editingActivity.id}`, activityData)
      
      fetchActivities()
      setShowEditForm(false)
      setEditingActivity(null)
    } catch (error) {
      console.error('Failed to update activity:', error)
    }
  }

  const deleteActivity = async (activityId: string) => {
    const result = await confirm({
      title: 'Delete Activity',
      message: 'Are you sure you want to delete this activity? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      icon: 'delete'
    })
    
    if (!result) return

    try {
      await apiClient.delete(`/api/activities/${activityId}`)
      fetchActivities()
    } catch (error) {
      console.error('Failed to delete activity:', error)
      alert('Failed to delete activity. Please try again.')
    }
  }

  const filteredActivities = activities.filter(activity => {
    const matchesType = filterType === 'ALL' || activity.type === filterType
    const matchesStatus = filterStatus === 'ALL' || 
      (filterStatus === 'COMPLETED' && activity.completedAt) ||
      (filterStatus === 'PENDING' && !activity.completedAt)
    const matchesSearch = searchTerm === '' ||
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.lead?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesType && matchesStatus && matchesSearch
  })

  const getActivityTypeInfo = (type: ActivityType) => {
    return activityTypes.find(t => t.value === type) || activityTypes[0]
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-700">Loading activities...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <NavBar />

        <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          {/* Mobile-first Header */}
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
                <p className="text-gray-600">Total: {filteredActivities.length} activities</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                >
                  <span className="mr-2">🔍</span>
                  <span className="hidden sm:inline">Filters</span>
                  <span className="sm:hidden">Filter</span>
                </button>
                
                <div className="flex bg-white border border-gray-300 rounded-md">
                  <button
                    onClick={() => setViewMode('timeline')}
                    className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-l-md ${
                      viewMode === 'timeline' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="hidden sm:inline">Timeline</span>
                    <span className="sm:hidden">⏰</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-r-md border-l ${
                      viewMode === 'list' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-50 border-gray-300'
                    }`}
                  >
                    <span className="hidden sm:inline">List</span>
                    <span className="sm:hidden">☰</span>
                  </button>
                </div>
                
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                >
                  <span className="mr-2">+</span>
                  <span className="hidden sm:inline">Add Activity</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile-optimized Filters */}
          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                  <input
                    type="text"
                    placeholder="Search activities, contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as ActivityType | 'ALL')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ALL">All Types</option>
                      {activityTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'COMPLETED' | 'PENDING')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ALL">All Status</option>
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFilterType('ALL')
                      setFilterStatus('ALL')
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300 text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <ActivityTimeline 
              activities={filteredActivities}
              onMarkCompleted={markAsCompleted}
              onEdit={handleEditActivity}
              onDelete={deleteActivity}
              getActivityTypeInfo={getActivityTypeInfo}
            />
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <ActivityList 
              activities={filteredActivities}
              onMarkCompleted={markAsCompleted}
              onEdit={handleEditActivity}
              onDelete={deleteActivity}
              getActivityTypeInfo={getActivityTypeInfo}
            />
          )}

          {/* No Results */}
          {filteredActivities.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-4xl text-gray-400 mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterType !== 'ALL' || filterStatus !== 'ALL' 
                  ? 'Try adjusting your search criteria' 
                  : 'Start tracking interactions by adding your first activity'}
              </p>
              {!searchTerm && filterType === 'ALL' && filterStatus === 'ALL' && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Add First Activity
                </button>
              )}
            </div>
          )}
        </main>

        {/* Add Activity Modal */}
        {showAddForm && (
          <AddActivityModal 
            onAdd={addActivity} 
            onClose={() => setShowAddForm(false)}
            activityTypes={activityTypes}
          />
        )}

        {/* Edit Activity Modal */}
        {showEditForm && editingActivity && (
          <EditActivityModal 
            activity={editingActivity}
            onEdit={updateActivity} 
            onClose={() => {
              setShowEditForm(false)
              setEditingActivity(null)
            }}
            activityTypes={activityTypes}
          />
        )}
      </div>
    </AuthGuard>
  )
}

// Timeline Component
function ActivityTimeline({ activities, onMarkCompleted, onEdit, onDelete, getActivityTypeInfo }: {
  activities: Activity[]
  onMarkCompleted: (id: string) => void
  onEdit: (activity: Activity) => void
  onDelete: (id: string) => void
  getActivityTypeInfo: (type: ActivityType) => any
}) {
  // Group activities by date
  const groupedActivities = activities.reduce((groups: Record<string, Activity[]>, activity) => {
    const date = new Date(activity.createdAt).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(activity)
    return groups
  }, {})

  return (
    <div className="space-y-6">
      {Object.entries(groupedActivities).map(([date, dayActivities]) => (
        <div key={date} className="relative">
          {/* Date Header */}
          <div className="sticky top-0 z-10 bg-gray-50 py-2 mb-4">
            <h3 className="text-sm font-medium text-gray-900 bg-white px-3 py-1 rounded-full border border-gray-200 inline-block">
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
          </div>
          
          {/* Timeline */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {/* Activities */}
            <div className="space-y-4">
              {dayActivities.map((activity, index) => {
                const typeInfo = getActivityTypeInfo(activity.type)
                const isCompleted = !!activity.completedAt
                
                return (
                  <div key={activity.id} className="relative flex items-start space-x-4">
                    {/* Timeline Dot */}
                    <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-sm ${
                      isCompleted ? 'bg-green-500' : typeInfo.color
                    }`}>
                      <span className="text-lg">{typeInfo.icon}</span>
                    </div>
                    
                    {/* Activity Card */}
                    <div className="flex-1 min-w-0 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </h4>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                            {isCompleted && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✅ Completed
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {!isCompleted && (
                            <button
                              onClick={() => onMarkCompleted(activity.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 border border-blue-600 rounded px-2 py-1"
                            >
                              Mark Done
                            </button>
                          )}
                          <button
                            onClick={() => onEdit(activity)}
                            className="text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded px-2 py-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(activity.id)}
                            className="text-xs text-red-600 hover:text-red-800 border border-red-300 rounded px-2 py-1"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      {activity.description && (
                        <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                      )}
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0 text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          {activity.lead && (
                            <span>👤 Lead: {activity.lead.name}</span>
                          )}
                          {activity.customer && (
                            <span>🤝 Customer: {activity.customer.name}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span>{new Date(activity.createdAt).toLocaleTimeString()}</span>
                          {activity.scheduledAt && (
                            <span>📅 {new Date(activity.scheduledAt).toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// List View Component
function ActivityList({ activities, onMarkCompleted, onEdit, onDelete, getActivityTypeInfo }: {
  activities: Activity[]
  onMarkCompleted: (id: string) => void
  onEdit: (activity: Activity) => void
  onDelete: (id: string) => void
  getActivityTypeInfo: (type: ActivityType) => any
}) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
      <ul className="divide-y divide-gray-200">
        {activities.map((activity) => {
          const typeInfo = getActivityTypeInfo(activity.type)
          const isCompleted = !!activity.completedAt
          
          return (
            <li key={activity.id} className="px-4 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${typeInfo.color}`}>
                    <span className="text-sm">{typeInfo.icon}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      {isCompleted && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-gray-500">
                      <span>{typeInfo.label}</span>
                      {activity.lead && <span>👤 {activity.lead.name}</span>}
                      {activity.customer && <span>🤝 {activity.customer.name}</span>}
                      <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {activity.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{activity.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="ml-4 flex gap-2 flex-shrink-0">
                  {!isCompleted && (
                    <button
                      onClick={() => onMarkCompleted(activity.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 border border-blue-600 rounded px-2 py-1"
                    >
                      Mark Done
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(activity)}
                    className="text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded px-2 py-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(activity.id)}
                    className="text-xs text-red-600 hover:text-red-800 border border-red-300 rounded px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Add Activity Modal
function AddActivityModal({ onAdd, onClose, activityTypes }: {
  onAdd: (data: any) => void
  onClose: () => void
  activityTypes: any[]
}) {
  const [formData, setFormData] = useState({
    type: 'NOTE' as ActivityType,
    title: '',
    description: '',
    scheduledAt: '',
    leadId: '',
    customerId: '',
  })

  const [leads, setLeads] = useState([])
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    // Fetch leads and customers for linking
    Promise.all([
      apiClient.get('/api/leads').catch(() => []),
      apiClient.get('/api/customers').catch(() => [])
    ]).then(([leadsData, customersData]) => {
      setLeads(Array.isArray(leadsData) ? leadsData : [])
      setCustomers(Array.isArray(customersData) ? customersData : [])
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
      leadId: formData.leadId || null,
      customerId: formData.customerId || null,
    }
    
    onAdd(submitData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Add New Activity</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ActivityType })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of the activity"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Detailed notes about the activity"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Scheduled Date/Time</label>
              <input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Link to Lead</label>
                <select
                  value={formData.leadId}
                  onChange={(e) => setFormData({ ...formData, leadId: e.target.value, customerId: e.target.value ? '' : formData.customerId })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Lead</option>
                  {leads.map((lead: any) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} {lead.company && `(${lead.company})`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Link to Customer</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value, leadId: e.target.value ? '' : formData.leadId })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer: any) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.company && `(${customer.company})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
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
                Add Activity
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Edit Activity Modal
function EditActivityModal({ activity, onEdit, onClose, activityTypes }: {
  activity: Activity
  onEdit: (data: any) => void
  onClose: () => void
  activityTypes: any[]
}) {
  const [formData, setFormData] = useState({
    type: activity.type,
    title: activity.title || '',
    description: activity.description || '',
    scheduledAt: activity.scheduledAt ? new Date(activity.scheduledAt).toISOString().slice(0, 16) : '',
    leadId: activity.lead?.id || '',
    customerId: activity.customer?.id || '',
  })

  const [leads, setLeads] = useState([])
  const [customers, setCustomers] = useState([])

  useEffect(() => {
    // Fetch leads and customers for linking
    Promise.all([
      apiClient.get('/api/leads').catch(() => []),
      apiClient.get('/api/customers').catch(() => [])
    ]).then(([leadsData, customersData]) => {
      setLeads(Array.isArray(leadsData) ? leadsData : [])
      setCustomers(Array.isArray(customersData) ? customersData : [])
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
      leadId: formData.leadId || null,
      customerId: formData.customerId || null,
    }
    
    onEdit(submitData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Edit Activity</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ActivityType })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of the activity"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Detailed notes about the activity"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Scheduled Date/Time</label>
              <input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Link to Lead</label>
                <select
                  value={formData.leadId}
                  onChange={(e) => setFormData({ ...formData, leadId: e.target.value, customerId: e.target.value ? '' : formData.customerId })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Lead</option>
                  {leads.map((lead: any) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} {lead.company && `(${lead.company})`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Link to Customer</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value, leadId: e.target.value ? '' : formData.leadId })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer: any) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.company && `(${customer.company})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
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
                Update Activity
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}