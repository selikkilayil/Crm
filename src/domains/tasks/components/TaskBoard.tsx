'use client'

import { Task, taskStatuses, TaskStatusInfo, TaskPriorityInfo } from '../types'
import { TaskStatus, TaskPriority } from '@prisma/client'
import TaskCard from './TaskCard'

interface TaskBoardProps {
  tasks: Task[]
  onStatusChange: (id: string, status: TaskStatus) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  getStatusInfo: (status: TaskStatus) => TaskStatusInfo
  getPriorityInfo: (priority: TaskPriority) => TaskPriorityInfo
  isOverdue: (task: Task) => boolean
}

export default function TaskBoard({
  tasks,
  onStatusChange,
  onEdit,
  onDelete,
  getStatusInfo,
  getPriorityInfo,
  isOverdue
}: TaskBoardProps) {
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status)
  }

  return (
    <>
      {/* Mobile: Stack columns vertically */}
      <div className="block md:hidden space-y-6">
        {taskStatuses.map(statusColumn => (
          <div key={statusColumn.value} className={`${statusColumn.color} bg-opacity-20 rounded-lg p-4 border-2`}>
            <h3 className={`font-semibold mb-4 text-gray-900 text-sm sm:text-base`}>
              {statusColumn.icon} {statusColumn.label} ({getTasksByStatus(statusColumn.value as TaskStatus).length})
            </h3>
            
            <div className="space-y-3">
              {getTasksByStatus(statusColumn.value as TaskStatus).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={onStatusChange}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  getStatusInfo={getStatusInfo}
                  getPriorityInfo={getPriorityInfo}
                  isOverdue={isOverdue}
                />
              ))}
              {getTasksByStatus(statusColumn.value as TaskStatus).length === 0 && (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No {statusColumn.label.toLowerCase()} tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Desktop: Grid layout */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {taskStatuses.map(statusColumn => (
            <div key={statusColumn.value} className={`${statusColumn.color} bg-opacity-20 rounded-lg p-4 min-h-96 border-2`}>
              <h3 className={`font-semibold mb-4 text-gray-900`}>
                {statusColumn.icon} {statusColumn.label} ({getTasksByStatus(statusColumn.value as TaskStatus).length})
              </h3>
              
              <div className="space-y-3">
                {getTasksByStatus(statusColumn.value as TaskStatus).map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={onStatusChange}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    getStatusInfo={getStatusInfo}
                    getPriorityInfo={getPriorityInfo}
                    isOverdue={isOverdue}
                  />
                ))}
                {getTasksByStatus(statusColumn.value as TaskStatus).length === 0 && (
                  <div className="text-center py-6 text-gray-500 text-sm">
                    No {statusColumn.label.toLowerCase()} tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}