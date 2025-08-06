export { EventBus, eventBus } from './EventBus'
export type { BaseEvent, EventHandler, EventSubscription } from './EventBus'
export * from './EventTypes'
export * from './handlers'

// Helper functions for emitting common events
import { eventBus } from './EventBus'
import type { CrmEvent } from './EventTypes'

export class EventEmitter {
  static async emitUserCreated(data: {
    userId: string
    name: string
    email: string
    role: string
  }, userId?: string): Promise<void> {
    await eventBus.emit({
      type: 'user.created',
      timestamp: new Date(),
      userId,
      data
    })
  }

  static async emitUserUpdated(data: {
    userId: string
    changes: Record<string, any>
    previousData?: Record<string, any>
  }, userId?: string): Promise<void> {
    await eventBus.emit({
      type: 'user.updated',
      timestamp: new Date(),
      userId,
      data
    })
  }

  static async emitLeadCreated(data: {
    leadId: string
    name: string
    email: string
    status: string
    assignedUserId?: string
  }, userId?: string): Promise<void> {
    await eventBus.emit({
      type: 'lead.created',
      timestamp: new Date(),
      userId,
      data
    })
  }

  static async emitLeadStatusChanged(data: {
    leadId: string
    oldStatus: string
    newStatus: string
    assignedUserId?: string
  }, userId?: string): Promise<void> {
    await eventBus.emit({
      type: 'lead.status.changed',
      timestamp: new Date(),
      userId,
      data
    })
  }

  static async emitLeadConverted(data: {
    leadId: string
    customerId?: string
    leadName: string
    leadEmail: string
  }, userId?: string): Promise<void> {
    await eventBus.emit({
      type: 'lead.converted',
      timestamp: new Date(),
      userId,
      data
    })
  }

  static async emitCustomerCreated(data: {
    customerId: string
    name: string
    email: string
    company?: string
  }, userId?: string): Promise<void> {
    await eventBus.emit({
      type: 'customer.created',
      timestamp: new Date(),
      userId,
      data
    })
  }

  static async emitTaskCreated(data: {
    taskId: string
    title: string
    description?: string
    priority: string
    dueDate?: Date
    assignedUserId: string
    leadId?: string
    customerId?: string
  }, userId?: string): Promise<void> {
    await eventBus.emit({
      type: 'task.created',
      timestamp: new Date(),
      userId,
      data
    })
  }

  static async emitTaskCompleted(data: {
    taskId: string
    title: string
    assignedUserId: string
    completedAt: Date
  }, userId?: string): Promise<void> {
    await eventBus.emit({
      type: 'task.completed',
      timestamp: new Date(),
      userId,
      data
    })
  }

  static async emitQuotationSent(data: {
    quotationId: string
    quotationNumber: string
    customerId: string
    customerEmail: string
    totalAmount: number
  }, userId?: string): Promise<void> {
    await eventBus.emit({
      type: 'quotation.sent',
      timestamp: new Date(),
      userId,
      data
    })
  }

  static async emitGeneric(event: CrmEvent): Promise<void> {
    await eventBus.emit(event)
  }
}