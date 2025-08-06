import { z } from 'zod'
import { TaskStatus, TaskPriority } from '@prisma/client'

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  assignedToId: z.string().uuid('Invalid user ID').optional().nullable(),
  leadId: z.string().uuid('Invalid lead ID').optional().nullable(),
  customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
  assignedToId: z.string().uuid('Invalid user ID').optional().nullable(),
  leadId: z.string().uuid('Invalid lead ID').optional().nullable(),
  customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
})

export const taskFiltersSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assignedToId: z.string().uuid('Invalid user ID').optional(),
  leadId: z.string().uuid('Invalid lead ID').optional(),
  customerId: z.string().uuid('Invalid customer ID').optional(),
  search: z.string().max(100, 'Search term too long').optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().min(1).max(100).optional(),
})

export function validateTask(data: any) {
  return createTaskSchema.safeParse(data)
}

export function validateTaskUpdate(data: any) {
  return updateTaskSchema.safeParse(data)
}

export function validateTaskFilters(data: any) {
  return taskFiltersSchema.safeParse(data)
}