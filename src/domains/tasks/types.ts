import { TaskStatus, TaskPriority } from '@prisma/client'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  completedAt: string | null
  createdAt: Date
  updatedAt: Date
  assignedToId?: string | null
  leadId?: string | null
  customerId?: string | null
  createdById: string
  assignedTo?: {
    id: string
    name: string
    email: string
    role: string
  }
  createdBy: {
    id: string
    name: string
    email: string
  }
  lead?: {
    id: string
    name: string
    company: string | null
    email: string
    phone: string | null
  }
  customer?: {
    id: string
    name: string
    company: string | null
    email: string
    phone: string | null
  }
}

export interface CreateTaskRequest {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string | null
  assignedToId?: string | null
  leadId?: string | null
  customerId?: string | null
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string | null
  completedAt?: string | null
  assignedToId?: string | null
  leadId?: string | null
  customerId?: string | null
}

export interface TaskStatusInfo {
  value: TaskStatus
  label: string
  color: string
  icon: string
}

export interface TaskPriorityInfo {
  value: TaskPriority
  label: string
  color: string
  icon: string
}

export const taskStatuses: TaskStatusInfo[] = [
  { value: 'PENDING', label: 'Pending', color: 'bg-gray-100 text-gray-800', icon: '⏳' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-800', icon: '🔄' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-green-100 text-green-800', icon: '✅' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' },
]

export const taskPriorities: TaskPriorityInfo[] = [
  { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-800', icon: '🔽' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: '➡️' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800', icon: '🔼' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-red-100 text-red-800', icon: '🚨' },
]

export type TaskStatusFilter = TaskStatus | 'ALL'
export type TaskPriorityFilter = TaskPriority | 'ALL'
export type TaskViewMode = 'board' | 'list'