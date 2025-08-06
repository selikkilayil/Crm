import { NextRequest, NextResponse } from 'next/server'
import { TaskService } from './services/TaskService'
import { validateTask, validateTaskUpdate, validateTaskFilters } from './validation'
import { requireAuth, getDataFilter, hasPermission } from '@/lib/auth-server'

const taskService = new TaskService()

export class TaskHandlers {
  static async getTasks(request: NextRequest): Promise<NextResponse> {
    try {
      const user = await requireAuth(request)
      
      // Check permissions
      const canViewAll = hasPermission(user, 'tasks_view_all')
      const canViewAssigned = hasPermission(user, 'tasks_view_assigned')
      
      if (!canViewAll && !canViewAssigned) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      
      const { searchParams } = new URL(request.url)
      const filters = {
        status: searchParams.get('status') || undefined,
        priority: searchParams.get('priority') || undefined,
        assignedToId: searchParams.get('assignedToId') || undefined,
        leadId: searchParams.get('leadId') || undefined,
        customerId: searchParams.get('customerId') || undefined,
        search: searchParams.get('search') || undefined,
        page: parseInt(searchParams.get('page') || '1'),
        limit: Math.min(100, parseInt(searchParams.get('limit') || '50')),
      }

      // Validate filters
      const validationResult = validateTaskFilters(filters)
      if (!validationResult.success) {
        return NextResponse.json({ 
          error: 'Invalid filters', 
          details: validationResult.error.issues 
        }, { status: 400 })
      }
      
      // Build where clause based on user role and permissions
      let whereClause: any = {}
      
      // Apply role-based data filtering if user can only view assigned
      if (!canViewAll && canViewAssigned) {
        const dataFilter = getDataFilter(user.role, user.id)
        // For tasks, if user can only view assigned, show tasks assigned to them or created by them
        whereClause.OR = [
          { assignedToId: user.id },
          { createdById: user.id },
          ...(dataFilter ? [dataFilter] : [])
        ]
      }
      
      const tasks = await taskService.getTasks({
        filters: validationResult.data,
        page: validationResult.data.page,
        limit: validationResult.data.limit,
        where: whereClause
      })
      
      return NextResponse.json(tasks)
    } catch (error: any) {
      console.error('Get tasks error:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
    }
  }

  static async createTask(request: NextRequest): Promise<NextResponse> {
    try {
      const user = await requireAuth(request)
      
      if (!hasPermission(user, 'tasks_create')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      
      const body = await request.json()
      
      // Validate request data
      const validationResult = validateTask(body)
      if (!validationResult.success) {
        return NextResponse.json({ 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        }, { status: 400 })
      }

      const taskData = {
        ...validationResult.data,
        createdById: body.createdById || user.id,
      }

      const task = await taskService.createTask(taskData)
      return NextResponse.json(task, { status: 201 })
    } catch (error: any) {
      console.error('Task creation error:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      if (error.message?.includes('not found')) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
    }
  }

  static async getTaskById(id: string, request?: NextRequest): Promise<NextResponse> {
    try {
      if (request) {
        const user = await requireAuth(request)
        
        const canViewAll = hasPermission(user, 'tasks_view_all')
        const canViewAssigned = hasPermission(user, 'tasks_view_assigned')
        
        if (!canViewAll && !canViewAssigned) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
      }

      const task = await taskService.getTaskById(id)
      
      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 })
      }
      
      return NextResponse.json(task)
    } catch (error: any) {
      console.error('Get task error:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      
      return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
    }
  }

  static async updateTask(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      const user = await requireAuth(request)
      
      const canEditAll = hasPermission(user, 'tasks_edit_all')
      const canEditAssigned = hasPermission(user, 'tasks_edit_assigned')
      
      if (!canEditAll && !canEditAssigned) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }

      // If user can only edit assigned tasks, check if they are assigned or created the task
      if (!canEditAll && canEditAssigned) {
        const task = await taskService.getTaskById(id)
        if (task && task.assignedToId !== user.id && task.createdById !== user.id) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
      }

      const body = await request.json()
      
      // Validate request data
      const validationResult = validateTaskUpdate(body)
      if (!validationResult.success) {
        return NextResponse.json({ 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        }, { status: 400 })
      }

      const task = await taskService.updateTask(id, validationResult.data)
      return NextResponse.json(task)
    } catch (error: any) {
      console.error('Task update error:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      if (error.message?.includes('not found')) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
    }
  }

  static async deleteTask(id: string, request?: NextRequest): Promise<NextResponse> {
    try {
      if (request) {
        const user = await requireAuth(request)
        
        if (!hasPermission(user, 'tasks_delete')) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
      }

      await taskService.deleteTask(id)
      return NextResponse.json({ message: 'Task deleted successfully' })
    } catch (error: any) {
      console.error('Task deletion error:', error)
      
      if (error.message === 'Authentication required') {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
      if (error.message?.includes('not found')) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
    }
  }
}