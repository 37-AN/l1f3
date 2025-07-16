import { MCPMessage, MCPServer } from '../mcp-framework/interfaces/mcp.interface';
export declare class SentryMCPServer {
    private readonly logger;
    private client;
    constructor();
    private initializeClient;
    getServerConfig(): MCPServer;
    handleMessage(message: MCPMessage): Promise<MCPMessage>;
    private handlePing;
    private getIssues;
    private getEvents;
    private createIssue;
    private resolveIssue;
    private getTransactions;
    private getPerformanceData;
    private createAlert;
    private getAlerts;
    private updateAlert;
    private generateEventId;
    private getTimestamp;
    private parsePeriod;
}
