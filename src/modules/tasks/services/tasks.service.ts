import { apiClient } from '@/shared/services'
import { Task, TaskFormData } from '../types'
import { TaskStatus } from '@prisma/client'

export class TasksService {
  async getAll(): Promise<Task[]> {
    try {
      const data = await apiClient.get('/api/tasks')
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      return []
    }
  }

  async create(taskData: TaskFormData, createdById: string): Promise<Task> {
    return await apiClient.post('/api/tasks', {
      ...taskData,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
      assignedToId: taskData.assignedToId || null,
      leadId: taskData.leadId || null,
      customerId: taskData.customerId || null,
      createdById,
    })
  }

  async update(id: string, taskData: Partial<TaskFormData>): Promise<Task> {
    const updateData = {
      ...taskData,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
      assignedToId: taskData.assignedToId || null,
      leadId: taskData.leadId || null,
      customerId: taskData.customerId || null,
    }
    return await apiClient.put(`/api/tasks/${id}`, updateData)
  }

  async updateStatus(id: string, newStatus: TaskStatus): Promise<Task> {
    return await apiClient.put(`/api/tasks/${id}`, { 
      status: newStatus,
      ...(newStatus === 'COMPLETED' && { completedAt: new Date().toISOString() })
    })
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/tasks/${id}`)
  }
}

export const tasksService = new TasksService()