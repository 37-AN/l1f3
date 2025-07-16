import { MCPEvent } from './interfaces/mcp.interface';
export declare class MCPEventDispatcher {
    private readonly logger;
    private readonly eventHandlers;
    private readonly eventQueue;
    private processing;
    registerHandler(eventType: string, handler: (event: MCPEvent) => Promise<void>): void;
    dispatch(event: MCPEvent): Promise<void>;
    private processQueue;
    private processEvent;
    createSyncEvent(serverId: string, integrationId: string, data: any): MCPEvent;
    createUpdateEvent(serverId: string, integrationId: string, data: any): MCPEvent;
    createCreateEvent(serverId: string, integrationId: string, data: any): MCPEvent;
    createDeleteEvent(serverId: string, integrationId: string, data: any): MCPEvent;
    createErrorEvent(serverId: string, integrationId: string, error: Error): MCPEvent;
    getEventStats(): {
        queueSize: number;
        processing: boolean;
        handlerCount: number;
    };
    clearQueue(): void;
    private generateEventId;
}
