'use client'

import { Activity, ActivityTypeInfo, activityTypes } from '../types'
import { ActivityType } from '@prisma/client'

interface ActivityTimelineProps {
  activities: Activity[]
  onMarkCompleted: (id: string) => void
  onEdit: (activity: Activity) => void
  onDelete: (id: string) => void
}

export default function ActivityTimeline({
  activities,
  onMarkCompleted,
  onEdit,
  onDelete
}: ActivityTimelineProps) {
  const getActivityTypeInfo = (type: ActivityType): ActivityTypeInfo => {
    return activityTypes.find(t => t.value === type) || activityTypes[0]
  }

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
              {dayActivities.map((activity) => {
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