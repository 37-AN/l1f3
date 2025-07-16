import { MCPFrameworkService } from './mcp-framework.service';
import { MCPServer, MCPIntegration, MCPSyncResult, MCPMessage } from './interfaces/mcp.interface';
export declare class MCPIntegrationController {
    private readonly mcpFrameworkService;
    private readonly logger;
    constructor(mcpFrameworkService: MCPFrameworkService);
    getServers(): MCPServer[];
    getServer(serverId: string): MCPServer;
    registerServer(serverConfig: Partial<MCPServer>): Promise<MCPServer>;
    getIntegrations(): MCPIntegration[];
    getIntegration(integrationId: string): MCPIntegration;
    registerIntegration(integrationConfig: Partial<MCPIntegration>): Promise<MCPIntegration>;
    updateIntegration(integrationId: string, updates: Partial<MCPIntegration>): Promise<MCPIntegration>;
    syncIntegration(integrationId: string): Promise<MCPSyncResult>;
    syncAllIntegrations(): Promise<MCPSyncResult[]>;
    sendMessage(serverId: string, message: MCPMessage): Promise<MCPMessage>;
    getUnifiedSchema(): import("./interfaces/mcp.interface").MCPUnifiedSchema;
    getFrameworkStatus(): {
        servers: {
            total: number;
            connected: number;
            disconnected: number;
            error: number;
        };
        integrations: {
            total: number;
            enabled: number;
            autoSync: number;
        };
        schema: {
            version: string;
            entities: number;
            relationships: number;
        };
    };
    testConnection(serverId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
