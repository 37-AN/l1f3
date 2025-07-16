import { MCPMessage, MCPServer, MCPIntegration, MCPEvent, MCPSyncResult, MCPUnifiedSchema } from './interfaces/mcp.interface';
import { MCPServerManager } from './mcp-server-manager.service';
import { MCPEventDispatcher } from './mcp-event-dispatcher.service';
import { MCPDataSyncService } from './mcp-data-sync.service';
export declare class MCPFrameworkService {
    private readonly serverManager;
    private readonly eventDispatcher;
    private readonly dataSyncService;
    private readonly logger;
    private readonly servers;
    private readonly integrations;
    private unifiedSchema;
    constructor(serverManager: MCPServerManager, eventDispatcher: MCPEventDispatcher, dataSyncService: MCPDataSyncService);
    private initializeUnifiedSchema;
    registerServer(serverConfig: Partial<MCPServer>): Promise<MCPServer>;
    getServers(): MCPServer[];
    getServer(serverId: string): MCPServer | undefined;
    registerIntegration(integration: Partial<MCPIntegration>): Promise<MCPIntegration>;
    getIntegrations(): MCPIntegration[];
    getIntegration(integrationId: string): MCPIntegration | undefined;
    sendMessage(serverId: string, message: MCPMessage): Promise<MCPMessage>;
    syncIntegration(integrationId: string): Promise<MCPSyncResult>;
    syncAllIntegrations(): Promise<MCPSyncResult[]>;
    private startAutoSync;
    getUnifiedSchema(): MCPUnifiedSchema;
    processEvent(event: MCPEvent): Promise<void>;
    private generateId;
}
