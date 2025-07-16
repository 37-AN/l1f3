import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MCPFrameworkService } from './mcp-framework.service';
export declare class MCPInitializationService implements OnModuleInit {
    private readonly configService;
    private readonly mcpFrameworkService;
    private readonly logger;
    constructor(configService: ConfigService, mcpFrameworkService: MCPFrameworkService);
    onModuleInit(): Promise<void>;
    private initializeMCPServers;
    private registerIntegrations;
    private startAutomationRules;
    private logFrameworkStatus;
    getHealthStatus(): Promise<any>;
    triggerFullSync(): Promise<any>;
    getFinancialTargets(): any;
}
