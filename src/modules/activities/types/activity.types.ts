import { ActivityType } from '@prisma/client'

export interface Activity {
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

export interface ActivityFormData {
  type: ActivityType
  title: string
  description: string
  scheduledAt: string
  leadId: string
  customerId: string
}

export interface ActivityTypeInfo {
  value: string
  label: string
  icon: string
  color: string
}

export const activityTypes: ActivityTypeInfo[] = [
  { value: 'NOTE', label: 'Note', icon: '📝', color: 'bg-gray-100 text-gray-800' },
  { value: 'CALL', label: 'Call', icon: '📞', color: 'bg-blue-100 text-blue-800' },
  { value: 'EMAIL', label: 'Email', icon: '📧', color: 'bg-green-100 text-green-800' },
  { value: 'MEETING', label: 'Meeting', icon: '🤝', color: 'bg-purple-100 text-purple-800' },
  { value: 'TASK', label: 'Task', icon: '✅', color: 'bg-orange-100 text-orange-800' },
]

export type ActivityFilterType = ActivityType | 'ALL'
export type ActivityStatusFilter = 'ALL' | 'COMPLETED' | 'PENDING'
export type ActivityViewMode = 'timeline' | 'list'