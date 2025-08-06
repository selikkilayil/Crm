import { z } from 'zod'
import { UserRole } from '@prisma/client'

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(UserRole),
  customRoleId: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(UserRole).optional(),
  customRoleId: z.string().optional(),
  isActive: z.boolean().optional(),
})

export const updatePasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export function validateUser(data: any) {
  return createUserSchema.safeParse(data)
}

export function validateUserUpdate(data: any) {
  return updateUserSchema.safeParse(data)
}

export function validatePasswordUpdate(data: any) {
  return updatePasswordSchema.safeParse(data)
}