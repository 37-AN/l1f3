import { MCPMessage, MCPServer } from '../mcp-framework/interfaces/mcp.interface';
export declare class NotionMCPServer {
    private readonly logger;
    private client;
    constructor();
    private initializeClient;
    getServerConfig(): MCPServer;
    handleMessage(message: MCPMessage): Promise<MCPMessage>;
    private handlePing;
    private queryDatabase;
    private createPage;
    private updatePage;
    private getPage;
    private deletePage;
    private searchPages;
    private getBlocks;
    private appendBlocks;
    private updateBlock;
    createLIF3Documentation(title: string, content: string, category: string): Promise<any>;
    updateGoalProgress(goalId: string, progress: number, notes: string): Promise<any>;
}
