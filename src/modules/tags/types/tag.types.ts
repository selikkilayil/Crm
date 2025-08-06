export interface Tag {
  id: string
  name: string
  color: string
  description: string | null
  createdAt: string
  updatedAt: string
  _count: {
    leads: number
    customers: number
  }
}

export interface TagFormData {
  name: string
  color: string
  description: string
}

export const predefinedColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
]