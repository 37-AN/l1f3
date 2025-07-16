import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    getHealth(): Promise<{
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
    getDetailedHealth(): Promise<{
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
    getConnectionStatus(): Promise<{
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
    getMCPHealth(): Promise<{
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
