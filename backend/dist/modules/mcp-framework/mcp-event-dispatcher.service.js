"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MCPEventDispatcher_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPEventDispatcher = void 0;
const common_1 = require("@nestjs/common");
let MCPEventDispatcher = MCPEventDispatcher_1 = class MCPEventDispatcher {
    constructor() {
        this.logger = new common_1.Logger(MCPEventDispatcher_1.name);
        this.eventHandlers = new Map();
        this.eventQueue = [];
        this.processing = false;
    }
    registerHandler(eventType, handler) {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, []);
        }
        this.eventHandlers.get(eventType).push(handler);
        this.logger.log(`Registered handler for event type: ${eventType}`);
    }
    async dispatch(event) {
        this.eventQueue.push(event);
        if (!this.processing) {
            await this.processQueue();
        }
    }
    async processQueue() {
        this.processing = true;
        try {
            while (this.eventQueue.length > 0) {
                const event = this.eventQueue.shift();
                if (event) {
                    await this.processEvent(event);
                }
            }
        }
        catch (error) {
            this.logger.error('Error processing event queue:', error);
        }
        finally {
            this.processing = false;
        }
    }
    async processEvent(event) {
        const handlers = this.eventHandlers.get(event.type) || [];
        if (handlers.length === 0) {
            this.logger.warn(`No handlers found for event type: ${event.type}`);
            return;
        }
        const promises = handlers.map(async (handler) => {
            try {
                await handler(event);
            }
            catch (error) {
                this.logger.error(`Handler failed for event ${event.id}:`, error);
                throw error;
            }
        });
        try {
            await Promise.allSettled(promises);
            event.processed = true;
            this.logger.debug(`Event processed: ${event.id} (${event.type})`);
        }
        catch (error) {
            this.logger.error(`Failed to process event ${event.id}:`, error);
        }
    }
    createSyncEvent(serverId, integrationId, data) {
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
    createUpdateEvent(serverId, integrationId, data) {
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
    createCreateEvent(serverId, integrationId, data) {
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
    createDeleteEvent(serverId, integrationId, data) {
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
    createErrorEvent(serverId, integrationId, error) {
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
    getEventStats() {
        return {
            queueSize: this.eventQueue.length,
            processing: this.processing,
            handlerCount: Array.from(this.eventHandlers.values()).reduce((total, handlers) => total + handlers.length, 0),
        };
    }
    clearQueue() {
        this.eventQueue.length = 0;
        this.processing = false;
        this.logger.log('Event queue cleared');
    }
    generateEventId() {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};
exports.MCPEventDispatcher = MCPEventDispatcher;
exports.MCPEventDispatcher = MCPEventDispatcher = MCPEventDispatcher_1 = __decorate([
    (0, common_1.Injectable)()
], MCPEventDispatcher);
//# sourceMappingURL=mcp-event-dispatcher.service.js.map