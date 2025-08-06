import { EventHandler } from '../EventBus'
import { CrmEvent, LeadCreatedEvent, TaskCreatedEvent, QuotationSentEvent } from '../EventTypes'

export class EmailNotificationHandler implements EventHandler<CrmEvent> {
  async handle(event: CrmEvent): Promise<void> {
    try {
      switch (event.type) {
        case 'lead.created':
          await this.handleLeadCreated(event as LeadCreatedEvent)
          break
        case 'task.created':
          await this.handleTaskCreated(event as TaskCreatedEvent)
          break
        case 'quotation.sent':
          await this.handleQuotationSent(event as QuotationSentEvent)
          break
        default:
          // No email notification needed for this event type
          break
      }
    } catch (error) {
      console.error('Failed to send email notification:', error)
    }
  }

  private async handleLeadCreated(event: LeadCreatedEvent): Promise<void> {
    // Send notification to assigned user (if any) about new lead
    if (event.data.assignedUserId) {
      console.log('Email notification: New lead assigned', {
        to: event.data.assignedUserId,
        lead: event.data.name,
        email: event.data.email
      })
      
      // TODO: Implement actual email sending
      // await emailService.sendLeadAssignedNotification(event.data.assignedUserId, event.data)
    }
  }

  private async handleTaskCreated(event: TaskCreatedEvent): Promise<void> {
    // Send notification to assigned user about new task
    console.log('Email notification: New task assigned', {
      to: event.data.assignedUserId,
      task: event.data.title,
      dueDate: event.data.dueDate
    })
    
    // TODO: Implement actual email sending
    // await emailService.sendTaskAssignedNotification(event.data.assignedUserId, event.data)
  }

  private async handleQuotationSent(event: QuotationSentEvent): Promise<void> {
    // Send quotation to customer
    console.log('Email notification: Quotation sent to customer', {
      to: event.data.customerEmail,
      quotationNumber: event.data.quotationNumber,
      amount: event.data.totalAmount
    })
    
    // TODO: Implement actual email sending with quotation PDF
    // await emailService.sendQuotationToCustomer(event.data)
  }
}

export class RealTimeNotificationHandler implements EventHandler<CrmEvent> {
  async handle(event: CrmEvent): Promise<void> {
    try {
      const notificationEvents = [
        'lead.created',
        'lead.status.changed',
        'task.created',
        'task.completed',
        'quotation.created'
      ]

      if (notificationEvents.includes(event.type)) {
        const notification = {
          id: `notif_${Date.now()}`,
          type: event.type,
          title: this.getNotificationTitle(event),
          message: this.getNotificationMessage(event),
          timestamp: event.timestamp,
          userId: event.userId,
          data: event.data
        }

        console.log('Real-time notification:', notification)
        
        // TODO: Implement real-time notification system (WebSocket, Server-Sent Events)
        // await notificationService.sendRealTimeNotification(notification)
      }
    } catch (error) {
      console.error('Failed to send real-time notification:', error)
    }
  }

  private getNotificationTitle(event: CrmEvent): string {
    switch (event.type) {
      case 'lead.created':
        return 'New Lead Created'
      case 'lead.status.changed':
        return 'Lead Status Updated'
      case 'task.created':
        return 'New Task Assigned'
      case 'task.completed':
        return 'Task Completed'
      case 'quotation.created':
        return 'New Quotation Created'
      default:
        return 'System Notification'
    }
  }

  private getNotificationMessage(event: CrmEvent): string {
    const data = event.data as any

    switch (event.type) {
      case 'lead.created':
        return `New lead "${data.name}" has been created`
      case 'lead.status.changed':
        return `Lead status changed from ${data.oldStatus} to ${data.newStatus}`
      case 'task.created':
        return `New task "${data.title}" has been assigned to you`
      case 'task.completed':
        return `Task "${data.title}" has been completed`
      case 'quotation.created':
        return `New quotation ${data.quotationNumber} has been created`
      default:
        return 'A system event has occurred'
    }
  }
}

export class SlackNotificationHandler implements EventHandler<CrmEvent> {
  async handle(event: CrmEvent): Promise<void> {
    try {
      const slackEvents = [
        'lead.converted',
        'quotation.sent',
        'task.completed'
      ]

      if (slackEvents.includes(event.type)) {
        const slackMessage = {
          channel: this.getChannelForEvent(event.type),
          message: this.formatSlackMessage(event),
          timestamp: event.timestamp
        }

        console.log('Slack notification:', slackMessage)
        
        // TODO: Implement Slack webhook integration
        // await slackService.sendMessage(slackMessage)
      }
    } catch (error) {
      console.error('Failed to send Slack notification:', error)
    }
  }

  private getChannelForEvent(eventType: string): string {
    switch (eventType) {
      case 'lead.converted':
        return '#sales'
      case 'quotation.sent':
        return '#sales'
      case 'task.completed':
        return '#general'
      default:
        return '#general'
    }
  }

  private formatSlackMessage(event: CrmEvent): string {
    const data = event.data as any

    switch (event.type) {
      case 'lead.converted':
        return `🎉 Lead "${data.leadName}" has been converted to a customer!`
      case 'quotation.sent':
        return `📄 Quotation ${data.quotationNumber} ($${data.totalAmount}) has been sent to customer`
      case 'task.completed':
        return `✅ Task "${data.title}" has been completed`
      default:
        return `System event: ${event.type}`
    }
  }
}