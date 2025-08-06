'use client'

import { Task, taskStatuses, TaskStatusInfo, TaskPriorityInfo } from '../types'
import { TaskStatus, TaskPriority } from '@prisma/client'

interface TaskListProps {
  tasks: Task[]
  onStatusChange: (id: string, status: TaskStatus) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  getStatusInfo: (status: TaskStatus) => TaskStatusInfo
  getPriorityInfo: (priority: TaskPriority) => TaskPriorityInfo
  isOverdue: (task: Task) => boolean
}

export default function TaskList({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  getStatusInfo,
  getPriorityInfo,
  isOverdue
}: TaskListProps) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
      <ul className="divide-y divide-gray-200">
        {tasks.map((task) => {
          const statusInfo = getStatusInfo(task.status)
          const priorityInfo = getPriorityInfo(task.priority)
          const overdue = isOverdue(task)
          
          return (
            <li key={task.id} className={`px-4 py-4 hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${statusInfo.color}`}>
                    <span className="text-sm">{statusInfo.icon}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.title}
                      </p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                        {priorityInfo.icon}
                      </span>
                      {overdue && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          🔥 Overdue
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-gray-500">
                      <span>{statusInfo.label}</span>
                      {task.assignedTo && <span>👤 {task.assignedTo.name}</span>}
                      {task.dueDate && (
                        <span className={overdue ? 'text-red-600 font-medium' : ''}>
                          📅 {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {task.lead && <span>🎯 {task.lead.name}</span>}
                      {task.customer && <span>🤝 {task.customer.name}</span>}
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="ml-4 flex items-center space-x-2 flex-shrink-0">
                  <select
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {taskStatuses.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.icon} {status.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => onEdit(task)}
                    className="text-xs text-gray-600 hover:text-gray-800 border border-gray-300 rounded px-2 py-1"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="text-xs text-red-600 hover:text-red-800 border border-red-300 rounded px-2 py-1"
                  >
                    🗑️
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