import { MCPServer, MCPMessage } from './interfaces/mcp.interface';
export declare class MCPServerManager {
    private readonly logger;
    private readonly connections;
    private readonly healthChecks;
    connectServer(server: MCPServer): Promise<void>;
    disconnectServer(serverId: string): Promise<void>;
    sendMessage(server: MCPServer, message: MCPMessage): Promise<MCPMessage>;
    getServerCapabilities(server: MCPServer): Promise<any>;
    private startHealthCheck;
    private stopHealthCheck;
    private retryRequest;
    getConnectionStatus(): Map<string, 'connected' | 'disconnected' | 'error'>;
    onModuleDestroy(): Promise<void>;
}
