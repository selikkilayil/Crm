import { TaskStatus, TaskPriority } from '@prisma/client'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  assignedToId?: string | null
  leadId?: string | null
  customerId?: string | null
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
  }
  customer?: {
    id: string
    name: string
    company: string | null
  }
}

export interface TaskFormData {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  assignedToId: string
  leadId: string
  customerId: string
}

export interface TaskStatusInfo {
  value: string
  label: string
  color: string
  icon: string
}

export interface TaskPriorityInfo {
  value: string
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