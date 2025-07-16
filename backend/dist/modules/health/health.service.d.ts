import { ConfigService } from '@nestjs/config';
import { MCPInitializationService } from '../mcp-framework/mcp-initialization.service';
export declare class HealthService {
    private readonly configService;
    private readonly mcpInitService;
    constructor(configService: ConfigService, mcpInitService: MCPInitializationService);
    checkHealth(): Promise<{
        status: string;
        timestamp: string;
        version: string;
        environment: any;
        timezone: any;
        unifiedAI: {
            netWorth: string;
            business: string;
            mrr: string;
            automation: string;
            performance: string;
        };
        mcp: any;
    }>;
    checkDetailedHealth(): Promise<{
        system: {
            nodeVersion: string;
            platform: NodeJS.Platform;
            arch: NodeJS.Architecture;
            uptime: number;
            memory: {
                used: number;
                total: number;
                external: number;
            };
        };
        configuration: {
            database: boolean;
            redis: boolean;
            googleDrive: boolean;
            discord: boolean;
            claude: boolean;
            email: boolean;
            mcp: {
                sentry: boolean;
                notion: boolean;
                asana: boolean;
                github: boolean;
                slack: boolean;
            };
        };
        status: string;
        timestamp: string;
        version: string;
        environment: any;
        timezone: any;
        unifiedAI: {
            netWorth: string;
            business: string;
            mrr: string;
            automation: string;
            performance: string;
        };
        mcp: any;
    }>;
    checkConnectionStatus(): Promise<{
        summary: {
            total: number;
            successful: number;
            failed: number;
            skipped: number;
        };
        connections: import("../../scripts/test-connections").ConnectionTestResult[];
        overall: string;
        timestamp: string;
    }>;
    checkMCPHealth(): Promise<{
        status: string;
        framework: any;
        targets: any;
        timestamp: string;
        error?: undefined;
    } | {
        status: string;
        error: any;
        timestamp: string;
        framework?: undefined;
        targets?: undefined;
    }>;
    triggerMCPSync(): Promise<any>;
}
