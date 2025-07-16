import { MCPIntegration, MCPServer, MCPSyncResult } from './interfaces/mcp.interface';
import { MCPServerManager } from './mcp-server-manager.service';
import { MCPEventDispatcher } from './mcp-event-dispatcher.service';
export declare class MCPDataSyncService {
    private readonly serverManager;
    private readonly eventDispatcher;
    private readonly logger;
    private readonly syncResults;
    constructor(serverManager: MCPServerManager, eventDispatcher: MCPEventDispatcher);
    syncIntegration(integration: MCPIntegration, server: MCPServer): Promise<MCPSyncResult>;
    private fetchSourceData;
    private transformData;
    private transformRecord;
    private applyTransformation;
    private applyMapping;
    private applyFormatting;
    private applyCalculation;
    private applyFilter;
    private syncToTarget;
    getSyncResult(integrationId: string): MCPSyncResult | undefined;
    getAllSyncResults(): MCPSyncResult[];
    clearSyncResults(): void;
}
