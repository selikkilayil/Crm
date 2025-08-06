export interface BaseEvent {
  type: string
  timestamp: Date
  userId?: string
  metadata?: Record<string, any>
}

export interface EventHandler<T extends BaseEvent = BaseEvent> {
  handle(event: T): Promise<void> | void
}

export interface EventSubscription {
  unsubscribe(): void
}

export class EventBus {
  private static instance: EventBus
  private handlers: Map<string, Set<EventHandler>> = new Map()

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus()
    }
    return EventBus.instance
  }

  subscribe<T extends BaseEvent>(
    eventType: string, 
    handler: EventHandler<T>
  ): EventSubscription {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }

    const handlerSet = this.handlers.get(eventType)!
    handlerSet.add(handler as EventHandler)

    return {
      unsubscribe: () => {
        handlerSet.delete(handler as EventHandler)
        if (handlerSet.size === 0) {
          this.handlers.delete(eventType)
        }
      }
    }
  }

  async emit<T extends BaseEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.type)
    if (!handlers || handlers.size === 0) {
      return
    }

    // Execute all handlers in parallel
    const promises = Array.from(handlers).map(async (handler) => {
      try {
        await handler.handle(event)
      } catch (error) {
        console.error(`Error handling event ${event.type}:`, error)
        // Don't throw - we don't want one failed handler to stop others
      }
    })

    await Promise.allSettled(promises)
  }

  getHandlerCount(eventType: string): number {
    return this.handlers.get(eventType)?.size || 0
  }

  clear(): void {
    this.handlers.clear()
  }

  removeAllHandlers(eventType: string): void {
    this.handlers.delete(eventType)
  }
}

// Global event bus instance
export const eventBus = EventBus.getInstance()