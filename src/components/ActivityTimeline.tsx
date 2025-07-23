'use client'

import { useState, useEffect } from 'react'
import { ActivityType } from '@prisma/client'

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

interface ActivityTimelineProps {
  leadId?: string
  customerId?: string
  maxItems?: number
  showAddButton?: boolean
  compact?: boolean
}

const activityTypes = [
  { value: 'NOTE', label: 'Note', icon: '📝', color: 'bg-gray-100 text-gray-800' },
  { value: 'CALL', label: 'Call', icon: '📞', color: 'bg-blue-100 text-blue-800' },
  { value: 'EMAIL', label: 'Email', icon: '📧', color: 'bg-green-100 text-green-800' },
  { value: 'MEETING', label: 'Meeting', icon: '🤝', color: 'bg-purple-100 text-purple-800' },
  { value: 'TASK', label: 'Task', icon: '✅', color: 'bg-orange-100 text-orange-800' },
]

export default function ActivityTimeline({ 
  leadId, 
  customerId, 
  maxItems = 10, 
  showAddButton = true,
  compact = false 
}: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    fetchActivities()
  }, [leadId, customerId])

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams()
      if (leadId) params.append('leadId', leadId)
      if (customerId) params.append('customerId', customerId)
      
      const response = await fetch(`/api/activities?${params}`)
      const data = await response.json()
      
      if (response.ok && Array.isArray(data)) {
        setActivities(data.slice(0, maxItems))
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
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...activityData,
          leadId: leadId || null,
          customerId: customerId || null,
        }),
      })

      if (response.ok) {
        fetchActivities()
        setShowAddForm(false)
      }
    } catch (error) {
      console.error('Failed to add activity:', error)
    }
  }

  const markAsCompleted = async (activityId: string) => {
    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          completedAt: new Date().toISOString() 
        }),
      })

      if (response.ok) {
        fetchActivities()
      }
    } catch (error) {
      console.error('Failed to update activity:', error)
    }
  }

  const getActivityTypeInfo = (type: ActivityType) => {
    return activityTypes.find(t => t.value === type) || activityTypes[0]
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className={`font-medium text-gray-900 ${compact ? 'text-base' : 'text-lg'}`}>
          Recent Activities ({activities.length})
        </h3>
        {showAddButton && (
          <button
            onClick={() => setShowAddForm(true)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add Activity
          </button>
        )}
      </div>

      {/* Timeline */}
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const typeInfo = getActivityTypeInfo(activity.type)
            const isCompleted = !!activity.completedAt
            
            return (
              <div key={activity.id} className="relative flex items-start space-x-3">
                {/* Timeline Line */}
                {!compact && index < activities.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
                )}
                
                {/* Timeline Dot */}
                <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white shadow-sm ${
                  isCompleted ? 'bg-green-500' : typeInfo.color
                }`}>
                  <span className={compact ? 'text-sm' : 'text-lg'}>{typeInfo.icon}</span>
                </div>
                
                {/* Activity Content */}
                <div className="flex-1 min-w-0 bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-gray-900 truncate ${compact ? 'text-sm' : 'text-base'}`}>
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
                    
                    {!isCompleted && (
                      <button
                        onClick={() => markAsCompleted(activity.id)}
                        className="ml-2 text-xs text-blue-600 hover:text-blue-800 border border-blue-600 rounded px-2 py-1 flex-shrink-0"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                  
                  {activity.description && (
                    <p className={`text-gray-600 mb-2 ${compact ? 'text-sm' : 'text-sm'} ${compact ? 'line-clamp-2' : ''}`}>
                      {activity.description}
                    </p>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0 text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                      <span>{new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {activity.scheduledAt && (
                      <div className="text-xs text-blue-600">
                        📅 Scheduled: {new Date(activity.scheduledAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 text-2xl mb-2">📋</div>
          <p className="text-gray-500 text-sm">No activities yet</p>
          {showAddButton && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Add the first activity
            </button>
          )}
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddForm && (
        <QuickAddActivityModal 
          onAdd={addActivity} 
          onClose={() => setShowAddForm(false)}
          activityTypes={activityTypes}
        />
      )}
    </div>
  )
}

// Quick Add Activity Modal
function QuickAddActivityModal({ onAdd, onClose, activityTypes }: {
  onAdd: (data: any) => void
  onClose: () => void
  activityTypes: any[]
}) {
  const [formData, setFormData] = useState({
    type: 'NOTE' as ActivityType,
    title: '',
    description: '',
    scheduledAt: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      scheduledAt: formData.scheduledAt ? new Date(formData.scheduledAt).toISOString() : null,
    }
    
    onAdd(submitData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-screen overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-900">Add Activity</h3>
          
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
                placeholder="Brief description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Additional details"
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
            
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
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
                Add Activity
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}