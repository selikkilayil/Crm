'use client'

import { useState } from 'react'
import { ActivityType } from '@prisma/client'
import { useConfirm } from '@/lib/confirmation-context'
import { AuthGuard, NavBar } from '@/shared/components'
import { 
  ActivityTimeline,
  ActivityList,
  ActivityForm,
  useActivities,
  activityTypes,
  Activity,
  ActivityFilterType,
  ActivityStatusFilter,
  ActivityViewMode
} from '@/modules/activities'

export default function ActivitiesPage() {
  const confirm = useConfirm()
  const { activities, loading, addActivity, updateActivity, markCompleted, removeActivity } = useActivities()
  const [viewMode, setViewMode] = useState<ActivityViewMode>('timeline')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filterType, setFilterType] = useState<ActivityFilterType>('ALL')
  const [filterStatus, setFilterStatus] = useState<ActivityStatusFilter>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  const handleCreateActivity = async (activityData: any) => {
    try {
      await addActivity(activityData)
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to add activity:', error)
      throw error
    }
  }

  const handleMarkCompleted = async (activityId: string) => {
    try {
      await markCompleted(activityId)
    } catch (error) {
      console.error('Failed to mark activity as completed:', error)
    }
  }

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity)
    setShowEditForm(true)
  }

  const handleUpdateActivity = async (activityData: any) => {
    try {
      if (!editingActivity) return
      
      await updateActivity(editingActivity.id, activityData)
      setShowEditForm(false)
      setEditingActivity(null)
    } catch (error) {
      console.error('Failed to update activity:', error)
      throw error
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
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
      await removeActivity(activityId)
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
              onMarkCompleted={handleMarkCompleted}
              onEdit={handleEditActivity}
              onDelete={handleDeleteActivity}
            />
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <ActivityList 
              activities={filteredActivities}
              onMarkCompleted={handleMarkCompleted}
              onEdit={handleEditActivity}
              onDelete={handleDeleteActivity}
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
          <ActivityForm 
            onSubmit={handleCreateActivity} 
            onClose={() => setShowAddForm(false)}
            title="Add New Activity"
            submitLabel="Add Activity"
          />
        )}

        {/* Edit Activity Modal */}
        {showEditForm && editingActivity && (
          <ActivityForm 
            initialData={editingActivity}
            onSubmit={handleUpdateActivity} 
            onClose={() => {
              setShowEditForm(false)
              setEditingActivity(null)
            }}
            title="Edit Activity"
            submitLabel="Update Activity"
          />
        )}
      </div>
    </AuthGuard>
  )
}

