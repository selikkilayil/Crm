export { AuditLogHandler, SecurityAuditHandler } from './AuditHandlers'
export { EmailNotificationHandler, RealTimeNotificationHandler, SlackNotificationHandler } from './NotificationHandlers'

import { eventBus } from '../EventBus'
import { AuditLogHandler, SecurityAuditHandler } from './AuditHandlers'
import { EmailNotificationHandler, RealTimeNotificationHandler, SlackNotificationHandler } from './NotificationHandlers'

// Initialize and register all event handlers
export function initializeEventHandlers(): void {
  // Audit handlers
  const auditLogHandler = new AuditLogHandler()
  const securityAuditHandler = new SecurityAuditHandler()

  // Notification handlers  
  const emailNotificationHandler = new EmailNotificationHandler()
  const realTimeNotificationHandler = new RealTimeNotificationHandler()
  const slackNotificationHandler = new SlackNotificationHandler()

  // Register audit handlers for all events
  const allEventTypes = [
    'user.created', 'user.updated', 'user.deleted',
    'lead.created', 'lead.updated', 'lead.status.changed', 'lead.converted', 'lead.deleted',
    'customer.created', 'customer.updated', 'customer.deleted',
    'activity.created',
    'task.created', 'task.updated', 'task.completed',
    'quotation.created', 'quotation.updated', 'quotation.sent'
  ]

  allEventTypes.forEach(eventType => {
    eventBus.subscribe(eventType, auditLogHandler)
    eventBus.subscribe(eventType, securityAuditHandler)
    eventBus.subscribe(eventType, realTimeNotificationHandler)
  })

  // Register notification handlers for specific events
  eventBus.subscribe('lead.created', emailNotificationHandler)
  eventBus.subscribe('task.created', emailNotificationHandler)
  eventBus.subscribe('quotation.sent', emailNotificationHandler)
  
  eventBus.subscribe('lead.converted', slackNotificationHandler)
  eventBus.subscribe('quotation.sent', slackNotificationHandler)
  eventBus.subscribe('task.completed', slackNotificationHandler)

  console.log('Event handlers initialized')
}

// Cleanup function to unsubscribe all handlers
export function cleanupEventHandlers(): void {
  eventBus.clear()
  console.log('Event handlers cleaned up')
}