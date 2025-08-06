import { useState, useEffect } from 'react'
import { tasksService } from '../services'
import { Task, TaskFormData } from '../types'
import { TaskStatus } from '@prisma/client'

export function useTasks(userId?: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await tasksService.getAll()
      setTasks(data)
    } catch (err) {
      console.error('Failed to fetch tasks:', err)
      setError('Failed to fetch tasks')
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchTasks()
    }
  }, [userId])

  const addTask = async (taskData: TaskFormData, createdById: string) => {
    try {
      const newTask = await tasksService.create(taskData, createdById)
      setTasks(prev => [newTask, ...prev])
      return newTask
    } catch (error) {
      console.error('Failed to add task:', error)
      throw error
    }
  }

  const updateTask = async (id: string, taskData: Partial<TaskFormData>) => {
    try {
      const updatedTask = await tasksService.update(id, taskData)
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ))
      return updatedTask
    } catch (error) {
      console.error('Failed to update task:', error)
      throw error
    }
  }

  const updateTaskStatus = async (id: string, newStatus: TaskStatus) => {
    try {
      const updatedTask = await tasksService.updateStatus(id, newStatus)
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ))
      return updatedTask
    } catch (error) {
      console.error('Failed to update task status:', error)
      throw error
    }
  }

  const removeTask = async (id: string) => {
    try {
      await tasksService.delete(id)
      setTasks(prev => prev.filter(task => task.id !== id))
    } catch (error) {
      console.error('Failed to delete task:', error)
      throw error
    }
  }

  const refreshTasks = () => {
    fetchTasks()
  }

  return {
    tasks,
    loading,
    error,
    refreshTasks,
    addTask,
    updateTask,
    updateTaskStatus,
    removeTask
  }
}