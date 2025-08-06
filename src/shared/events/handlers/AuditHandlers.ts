import { EventHandler } from '../EventBus'
import { CrmEvent, AuditLogEvent } from '../EventTypes'

export class AuditLogHandler implements EventHandler<CrmEvent> {
  async handle(event: CrmEvent): Promise<void> {
    // Skip audit events to prevent infinite loops
    if (event.type === 'audit.log') {
      return
    }

    try {
      const auditEvent: AuditLogEvent = {
        type: 'audit.log',
        timestamp: new Date(),
        userId: event.userId,
        metadata: {
          originalEventType: event.type,
          originalTimestamp: event.timestamp
        },
        data: {
          action: this.extractAction(event.type),
          resource: this.extractResource(event.type),
          resourceId: this.extractResourceId(event),
          userId: event.userId || 'system',
          changes: this.extractChanges(event)
        }
      }

      // In a real implementation, this would save to a database
      console.log('Audit Log:', auditEvent)
      
      // TODO: Implement actual audit log storage
      // await auditLogRepository.create(auditEvent.data)
      
    } catch (error) {
      console.error('Failed to create audit log:', error)
    }
  }

  private extractAction(eventType: string): string {
    const [, action] = eventType.split('.')
    return action.toUpperCase()
  }

  private extractResource(eventType: string): string {
    const [resource] = eventType.split('.')
    return resource.toUpperCase()
  }

  private extractResourceId(event: CrmEvent): string {
    const data = event.data as any
    
    // Extract ID based on event type
    if (data.userId) return data.userId
    if (data.leadId) return data.leadId
    if (data.customerId) return data.customerId
    if (data.taskId) return data.taskId
    if (data.activityId) return data.activityId
    if (data.quotationId) return data.quotationId
    
    return 'unknown'
  }

  private extractChanges(event: CrmEvent): Record<string, any> | undefined {
    const data = event.data as any
    return data.changes || data
  }
}

export class SecurityAuditHandler implements EventHandler<CrmEvent> {
  async handle(event: CrmEvent): Promise<void> {
    const sensitiveEvents = [
      'user.created',
      'user.updated', 
      'user.deleted',
      'lead.converted',
      'quotation.sent'
    ]

    if (sensitiveEvents.includes(event.type)) {
      try {
        // Log security-relevant events with additional context
        const securityLog = {
          timestamp: new Date(),
          eventType: event.type,
          userId: event.userId || 'system',
          resourceId: this.extractResourceId(event),
          severity: this.getSeverity(event.type),
          metadata: {
            userAgent: event.metadata?.userAgent,
            ipAddress: event.metadata?.ipAddress,
            originalEvent: event
          }
        }

        console.log('Security Audit:', securityLog)
        
        // TODO: Implement security log storage
        // await securityLogRepository.create(securityLog)
        
      } catch (error) {
        console.error('Failed to create security audit log:', error)
      }
    }
  }

  private extractResourceId(event: CrmEvent): string {
    const data = event.data as any
    
    if (data.userId) return data.userId
    if (data.leadId) return data.leadId
    if (data.customerId) return data.customerId
    if (data.quotationId) return data.quotationId
    
    return 'unknown'
  }

  private getSeverity(eventType: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    const highSeverityEvents = ['user.deleted', 'lead.converted']
    const mediumSeverityEvents = ['user.created', 'user.updated', 'quotation.sent']
    
    if (highSeverityEvents.includes(eventType)) return 'HIGH'
    if (mediumSeverityEvents.includes(eventType)) return 'MEDIUM'
    return 'LOW'
  }
}