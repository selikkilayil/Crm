'use client'

import { useState } from 'react'
import { Task, taskStatuses, TaskStatusInfo, TaskPriorityInfo } from '../types'
import { TaskStatus, TaskPriority } from '@prisma/client'

interface TaskCardProps {
  task: Task
  onStatusChange: (id: string, status: TaskStatus) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  getStatusInfo: (status: TaskStatus) => TaskStatusInfo
  getPriorityInfo: (priority: TaskPriority) => TaskPriorityInfo
  isOverdue: (task: Task) => boolean
}

export default function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  getStatusInfo,
  getPriorityInfo,
  isOverdue
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const statusInfo = getStatusInfo(task.status)
  const priorityInfo = getPriorityInfo(task.priority)
  const overdue = isOverdue(task)

  return (
    <div className={`bg-white p-3 sm:p-4 rounded-md shadow-sm border-2 hover:shadow-md transition-shadow relative ${
      overdue ? 'border-red-300 bg-red-50' : 'border-gray-200'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0 pr-2">
          <h4 className="font-medium text-gray-900 text-sm sm:text-base leading-tight">{task.title}</h4>
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
              {priorityInfo.icon} <span className="ml-1">{priorityInfo.label}</span>
            </span>
            {overdue && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                🔥 <span className="ml-1">Overdue</span>
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-400 hover:text-gray-600 p-2 -m-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <span className="text-lg">⋮</span>
        </button>
      </div>
      
      {task.description && (
        <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">{task.description}</p>
      )}
      
      <div className="space-y-2 text-xs sm:text-sm text-gray-500">
        {task.assignedTo && (
          <div className="flex items-center">
            <span className="mr-2 text-sm">👤</span>
            <span className="truncate">{task.assignedTo.name}</span>
          </div>
        )}
        
        {task.lead && (
          <div className="flex items-center">
            <span className="mr-2 text-sm">🎯</span>
            <span className="truncate">Lead: {task.lead.name}</span>
          </div>
        )}
        
        {task.customer && (
          <div className="flex items-center">
            <span className="mr-2 text-sm">🤝</span>
            <span className="truncate">Customer: {task.customer.name}</span>
          </div>
        )}
        
        {task.dueDate && (
          <div className={`flex items-center ${overdue ? 'text-red-600 font-medium' : ''}`}>
            <span className="mr-2 text-sm">📅</span>
            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Actions Menu */}
      {showMenu && (
        <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-40 sm:min-w-44">
          <button
            onClick={() => {
              onEdit(task)
              setShowMenu(false)
            }}
            className="block w-full text-left px-4 py-3 sm:py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 min-h-[44px] flex items-center"
          >
            <span className="mr-2">✏️</span>
            Edit Task
          </button>
          <button
            onClick={() => {
              onDelete(task.id)
              setShowMenu(false)
            }}
            className="block w-full text-left px-4 py-3 sm:py-2 text-sm text-red-600 hover:bg-red-50 border-b border-gray-100 min-h-[44px] flex items-center"
          >
            <span className="mr-2">🗑️</span>
            Delete Task
          </button>
          <div className="py-1">
            <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Change Status
            </div>
            {taskStatuses
              .filter(status => status.value !== task.status)
              .map(status => (
                <button
                  key={status.value}
                  onClick={() => { 
                    onStatusChange(task.id, status.value as TaskStatus)
                    setShowMenu(false)
                  }}
                  className="block w-full text-left px-4 py-3 sm:py-2 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px] flex items-center"
                >
                  <span className="mr-2">{status.icon}</span>
                  {status.label}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}