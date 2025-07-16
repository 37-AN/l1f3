import { MCPMessage, MCPServer } from '../mcp-framework/interfaces/mcp.interface';
export declare class AsanaMCPServer {
    private readonly logger;
    private client;
    constructor();
    private initializeClient;
    getServerConfig(): MCPServer;
    handleMessage(message: MCPMessage): Promise<MCPMessage>;
    private handlePing;
    private getTasks;
    private createTask;
    private updateTask;
    private deleteTask;
    private completeTask;
    private getProjects;
    private createProject;
    private updateProject;
    private getProjectTasks;
    private getTeamMembers;
    private assignTask;
    private getWorkspaces;
    private createAutomationRule;
    private triggerAutomation;
    createLIF3Task(title: string, description: string, priority: string, dueDate?: string): Promise<any>;
    createErrorTask(errorData: any): Promise<any>;
}
