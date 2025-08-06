import { useState, useEffect } from 'react'
import { activitiesService } from '../services'
import { Activity, ActivityFormData } from '../types'

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await activitiesService.getAll()
      setActivities(data)
    } catch (err) {
      console.error('Failed to fetch activities:', err)
      setError('Failed to fetch activities')
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const addActivity = async (activityData: ActivityFormData) => {
    try {
      const newActivity = await activitiesService.create(activityData)
      setActivities(prev => [newActivity, ...prev])
      return newActivity
    } catch (error) {
      console.error('Failed to add activity:', error)
      throw error
    }
  }

  const updateActivity = async (id: string, activityData: Partial<ActivityFormData>) => {
    try {
      const updatedActivity = await activitiesService.update(id, activityData)
      setActivities(prev => prev.map(activity => 
        activity.id === id ? updatedActivity : activity
      ))
      return updatedActivity
    } catch (error) {
      console.error('Failed to update activity:', error)
      throw error
    }
  }

  const markCompleted = async (id: string) => {
    try {
      const updatedActivity = await activitiesService.markCompleted(id)
      setActivities(prev => prev.map(activity => 
        activity.id === id ? updatedActivity : activity
      ))
      return updatedActivity
    } catch (error) {
      console.error('Failed to mark activity as completed:', error)
      throw error
    }
  }

  const removeActivity = async (id: string) => {
    try {
      await activitiesService.delete(id)
      setActivities(prev => prev.filter(activity => activity.id !== id))
    } catch (error) {
      console.error('Failed to delete activity:', error)
      throw error
    }
  }

  const refreshActivities = () => {
    fetchActivities()
  }

  return {
    activities,
    loading,
    error,
    refreshActivities,
    addActivity,
    updateActivity,
    markCompleted,
    removeActivity
  }
}