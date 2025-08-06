import { BaseEvent } from './EventBus'

// User Events
export interface UserCreatedEvent extends BaseEvent {
  type: 'user.created'
  data: {
    userId: string
    name: string
    email: string
    role: string
  }
}

export interface UserUpdatedEvent extends BaseEvent {
  type: 'user.updated'
  data: {
    userId: string
    changes: Record<string, any>
    previousData?: Record<string, any>
  }
}

export interface UserDeletedEvent extends BaseEvent {
  type: 'user.deleted'
  data: {
    userId: string
    name: string
    email: string
  }
}

// Lead Events
export interface LeadCreatedEvent extends BaseEvent {
  type: 'lead.created'
  data: {
    leadId: string
    name: string
    email: string
    status: string
    assignedUserId?: string
  }
}

export interface LeadUpdatedEvent extends BaseEvent {
  type: 'lead.updated'
  data: {
    leadId: string
    changes: Record<string, any>
    previousData?: Record<string, any>
  }
}

export interface LeadStatusChangedEvent extends BaseEvent {
  type: 'lead.status.changed'
  data: {
    leadId: string
    oldStatus: string
    newStatus: string
    assignedUserId?: string
  }
}

export interface LeadConvertedEvent extends BaseEvent {
  type: 'lead.converted'
  data: {
    leadId: string
    customerId?: string
    leadName: string
    leadEmail: string
  }
}

export interface LeadDeletedEvent extends BaseEvent {
  type: 'lead.deleted'
  data: {
    leadId: string
    name: string
    email: string
  }
}

// Customer Events
export interface CustomerCreatedEvent extends BaseEvent {
  type: 'customer.created'
  data: {
    customerId: string
    name: string
    email: string
    company?: string
  }
}

export interface CustomerUpdatedEvent extends BaseEvent {
  type: 'customer.updated'
  data: {
    customerId: string
    changes: Record<string, any>
    previousData?: Record<string, any>
  }
}

export interface CustomerDeletedEvent extends BaseEvent {
  type: 'customer.deleted'
  data: {
    customerId: string
    name: string
    email: string
  }
}

// Activity Events
export interface ActivityCreatedEvent extends BaseEvent {
  type: 'activity.created'
  data: {
    activityId: string
    type: string
    description: string
    leadId?: string
    customerId?: string
    userId: string
  }
}

// Task Events
export interface TaskCreatedEvent extends BaseEvent {
  type: 'task.created'
  data: {
    taskId: string
    title: string
    description?: string
    priority: string
    dueDate?: Date
    assignedUserId: string
    leadId?: string
    customerId?: string
  }
}

export interface TaskUpdatedEvent extends BaseEvent {
  type: 'task.updated'
  data: {
    taskId: string
    changes: Record<string, any>
    previousData?: Record<string, any>
  }
}

export interface TaskCompletedEvent extends BaseEvent {
  type: 'task.completed'
  data: {
    taskId: string
    title: string
    assignedUserId: string
    completedAt: Date
  }
}

// Quotation Events
export interface QuotationCreatedEvent extends BaseEvent {
  type: 'quotation.created'
  data: {
    quotationId: string
    quotationNumber: string
    customerId: string
    totalAmount: number
    status: string
  }
}

export interface QuotationUpdatedEvent extends BaseEvent {
  type: 'quotation.updated'
  data: {
    quotationId: string
    changes: Record<string, any>
    previousData?: Record<string, any>
  }
}

export interface QuotationSentEvent extends BaseEvent {
  type: 'quotation.sent'
  data: {
    quotationId: string
    quotationNumber: string
    customerId: string
    customerEmail: string
    totalAmount: number
  }
}

// System Events
export interface AuditLogEvent extends BaseEvent {
  type: 'audit.log'
  data: {
    action: string
    resource: string
    resourceId: string
    userId: string
    changes?: Record<string, any>
    ipAddress?: string
  }
}

// Union type for all events
export type CrmEvent = 
  | UserCreatedEvent
  | UserUpdatedEvent 
  | UserDeletedEvent
  | LeadCreatedEvent
  | LeadUpdatedEvent
  | LeadStatusChangedEvent
  | LeadConvertedEvent
  | LeadDeletedEvent
  | CustomerCreatedEvent
  | CustomerUpdatedEvent
  | CustomerDeletedEvent
  | ActivityCreatedEvent
  | TaskCreatedEvent
  | TaskUpdatedEvent
  | TaskCompletedEvent
  | QuotationCreatedEvent
  | QuotationUpdatedEvent
  | QuotationSentEvent
  | AuditLogEvent