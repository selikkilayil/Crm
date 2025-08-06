import { apiClient } from '@/shared/services'
import { Activity, ActivityFormData } from '../types'

export class ActivitiesService {
  async getAll(): Promise<Activity[]> {
    try {
      const data = await apiClient.get('/api/activities')
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Failed to fetch activities:', error)
      return []
    }
  }

  async create(activityData: ActivityFormData): Promise<Activity> {
    return await apiClient.post('/api/activities', {
      ...activityData,
      scheduledAt: activityData.scheduledAt ? new Date(activityData.scheduledAt).toISOString() : null,
      leadId: activityData.leadId || null,
      customerId: activityData.customerId || null,
    })
  }

  async update(id: string, activityData: Partial<ActivityFormData>): Promise<Activity> {
    const updateData = {
      ...activityData,
      scheduledAt: activityData.scheduledAt ? new Date(activityData.scheduledAt).toISOString() : null,
      leadId: activityData.leadId || null,
      customerId: activityData.customerId || null,
    }
    return await apiClient.put(`/api/activities/${id}`, updateData)
  }

  async markCompleted(id: string): Promise<Activity> {
    return await apiClient.put(`/api/activities/${id}`, { 
      completedAt: new Date().toISOString() 
    })
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/activities/${id}`)
  }
}

export const activitiesService = new ActivitiesService()