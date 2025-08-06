'use client'

import { Activity, ActivityTypeInfo, activityTypes } from '../types'
import { ActivityType } from '@prisma/client'

interface ActivityListProps {
  activities: Activity[]
  onMarkCompleted: (id: string) => void
  onEdit: (activity: Activity) => void
  onDelete: (id: string) => void
}

export default function ActivityList({
  activities,
  onMarkCompleted,
  onEdit,
  onDelete
}: ActivityListProps) {
  const getActivityTypeInfo = (type: ActivityType): ActivityTypeInfo => {
    return activityTypes.find(t => t.value === type) || activityTypes[0]
  }

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