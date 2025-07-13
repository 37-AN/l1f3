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
        freshStart: {
            netWorth: string;
            business: string;
            journey: string;
        };
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
        };
        status: string;
        timestamp: string;
        version: string;
        environment: any;
        timezone: any;
        freshStart: {
            netWorth: string;
            business: string;
            journey: string;
        };
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
}
