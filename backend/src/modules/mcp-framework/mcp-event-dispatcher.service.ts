import { Injectable, Logger } from '@nestjs/common';
import { MCPEvent, MCPIntegration, MCPServer } from './interfaces/mcp.interface';

@Injectable()
export class MCPEventDispatcher {
  private readonly logger = new Logger(MCPEventDispatcher.name);
  private readonly eventHandlers = new Map<string, Array<(event: MCPEvent) => Promise<void>>>();
  private readonly eventQueue: MCPEvent[] = [];
  private processing = false;

  /**
   * Register event handler
   */
  registerHandler(eventType: string, handler: (event: MCPEvent) => Promise<void>): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    
    this.eventHandlers.get(eventType)!.push(handler);
    this.logger.log(`Registered handler for event type: ${eventType}`);
  }

  /**
   * Dispatch event to appropriate handlers
   */
  async dispatch(event: MCPEvent): Promise<void> {
    // Add to queue
    this.eventQueue.push(event);
    
    // Process queue if not already processing
    if (!this.processing) {
      await this.processQueue();
    }
  }

  /**
   * Process event queue
   */
  private async processQueue(): Promise<void> {
    this.processing = true;
    
    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        if (event) {
          await this.processEvent(event);
        }
      }
    } catch (error) {
      this.logger.error('Error processing event queue:', error);
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process individual event
   */
  private async processEvent(event: MCPEvent): Promise<void> {
    const handlers = this.eventHandlers.get(event.type) || [];
    
    if (handlers.length === 0) {
      this.logger.warn(`No handlers found for event type: ${event.type}`);
      return;
    }

    // Execute all handlers for this event type
    const promises = handlers.map(async (handler) => {
      try {
        await handler(event);
      } catch (error) {
        this.logger.error(`Handler failed for event ${event.id}:`, error);
        throw error;
      }
    });

    try {
      await Promise.allSettled(promises);
      event.processed = true;
      this.logger.debug(`Event processed: ${event.id} (${event.type})`);
    } catch (error) {
      this.logger.error(`Failed to process event ${event.id}:`, error);
    }
  }

  /**
   * Create sync event
   */
  createSyncEvent(serverId: string, integrationId: string, data: any): MCPEvent {
    return {
      id: this.generateEventId(),
      type: 'sync',
      serverId,
      integrationId,
      timestamp: new Date(),
      data,
      processed: false,
    };
  }

  /**
   * Create update event
   */
  createUpdateEvent(serverId: string, integrationId: string, data: any): MCPEvent {
    return {
      id: this.generateEventId(),
      type: 'update',
      serverId,
      integrationId,
      timestamp: new Date(),
      data,
      processed: false,
    };
  }

  /**
   * Create create event
   */
  createCreateEvent(serverId: string, integrationId: string, data: any): MCPEvent {
    return {
      id: this.generateEventId(),
      type: 'create',
      serverId,
      integrationId,
      timestamp: new Date(),
      data,
      processed: false,
    };
  }

  /**
   * Create delete event
   */
  createDeleteEvent(serverId: string, integrationId: string, data: any): MCPEvent {
    return {
      id: this.generateEventId(),
      type: 'delete',
      serverId,
      integrationId,
      timestamp: new Date(),
      data,
      processed: false,
    };
  }

  /**
   * Create error event
   */
  createErrorEvent(serverId: string, integrationId: string, error: Error): MCPEvent {
    return {
      id: this.generateEventId(),
      type: 'error',
      serverId,
      integrationId,
      timestamp: new Date(),
      data: {
        error: error.message,
        stack: error.stack,
      },
      processed: false,
    };
  }

  /**
   * Get event statistics
   */
  getEventStats(): {
    queueSize: number;
    processing: boolean;
    handlerCount: number;
  } {
    return {
      queueSize: this.eventQueue.length,
      processing: this.processing,
      handlerCount: Array.from(this.eventHandlers.values()).reduce((total, handlers) => total + handlers.length, 0),
    };
  }

  /**
   * Clear event queue (for testing/debugging)
   */
  clearQueue(): void {
    this.eventQueue.length = 0;
    this.processing = false;
    this.logger.log('Event queue cleared');
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}