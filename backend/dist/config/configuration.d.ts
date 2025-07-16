import mcpConfig from './mcp.config';
declare const _default: (() => {
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    database: {
        type: string;
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        url: string;
        synchronize: boolean;
        logging: boolean;
    };
    redis: {
        host: string;
        port: number;
        password: string;
        url: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    cors: {
        origin: string;
        credentials: boolean;
        methods: string;
        allowedHeaders: string;
    };
    logging: {
        level: string;
        format: string;
        filePath: string;
        maxSize: string;
        maxFiles: string;
    };
    security: {
        rateLimit: {
            windowMs: number;
            max: number;
        };
        helmet: {
            contentSecurityPolicy: boolean;
            hstsMaxAge: number;
        };
    };
    externalApis: {
        sentry: {
            dsn: string;
            authToken: string;
            org: string;
            project: string;
        };
        notion: {
            apiToken: string;
            databaseId: string;
            netWorthGoalId: string;
        };
        asana: {
            accessToken: string;
            lif3ProjectId: string;
            errorProjectId: string;
            workspaceId: string;
        };
        claude: {
            apiKey: string;
            model: string;
            maxTokens: number;
        };
        googleDrive: {
            clientId: string;
            clientSecret: string;
            refreshToken: string;
            folderId: string;
        };
        discord: {
            botToken: string;
            channelId: string;
        };
        nedbank: {
            apiKey: string;
            clientId: string;
            clientSecret: string;
        };
        okra: {
            secretKey: string;
            publicKey: string;
        };
        alphaVantage: {
            apiKey: string;
        };
        finnhub: {
            apiKey: string;
        };
    };
    financialTargets: {
        netWorthTarget: number;
        dailyRevenueTarget: number;
        mrrTarget: number;
    };
    ai: {
        briefingSchedule: string;
        goalCheckInterval: string;
        revenueTrackingInterval: string;
        expenseAnalysisInterval: string;
    };
    websocket: {
        port: number;
        corsOrigin: string;
    };
    monitoring: {
        enablePerformanceMonitoring: boolean;
        performanceSampleRate: number;
    };
    backup: {
        schedule: string;
        retentionDays: number;
        s3Bucket: string;
        s3Region: string;
    };
    testing: {
        databaseUrl: string;
        mailHost: string;
        mailPort: number;
        mailUser: string;
        mailPassword: string;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    nodeEnv: string;
    port: number;
    apiPrefix: string;
    database: {
        type: string;
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
        url: string;
        synchronize: boolean;
        logging: boolean;
    };
    redis: {
        host: string;
        port: number;
        password: string;
        url: string;
    };
    jwt: {
        secret: string;
        expiresIn: string;
    };
    cors: {
        origin: string;
        credentials: boolean;
        methods: string;
        allowedHeaders: string;
    };
    logging: {
        level: string;
        format: string;
        filePath: string;
        maxSize: string;
        maxFiles: string;
    };
    security: {
        rateLimit: {
            windowMs: number;
            max: number;
        };
        helmet: {
            contentSecurityPolicy: boolean;
            hstsMaxAge: number;
        };
    };
    externalApis: {
        sentry: {
            dsn: string;
            authToken: string;
            org: string;
            project: string;
        };
        notion: {
            apiToken: string;
            databaseId: string;
            netWorthGoalId: string;
        };
        asana: {
            accessToken: string;
            lif3ProjectId: string;
            errorProjectId: string;
            workspaceId: string;
        };
        claude: {
            apiKey: string;
            model: string;
            maxTokens: number;
        };
        googleDrive: {
            clientId: string;
            clientSecret: string;
            refreshToken: string;
            folderId: string;
        };
        discord: {
            botToken: string;
            channelId: string;
        };
        nedbank: {
            apiKey: string;
            clientId: string;
            clientSecret: string;
        };
        okra: {
            secretKey: string;
            publicKey: string;
        };
        alphaVantage: {
            apiKey: string;
        };
        finnhub: {
            apiKey: string;
        };
    };
    financialTargets: {
        netWorthTarget: number;
        dailyRevenueTarget: number;
        mrrTarget: number;
    };
    ai: {
        briefingSchedule: string;
        goalCheckInterval: string;
        revenueTrackingInterval: string;
        expenseAnalysisInterval: string;
    };
    websocket: {
        port: number;
        corsOrigin: string;
    };
    monitoring: {
        enablePerformanceMonitoring: boolean;
        performanceSampleRate: number;
    };
    backup: {
        schedule: string;
        retentionDays: number;
        s3Bucket: string;
        s3Region: string;
    };
    testing: {
        databaseUrl: string;
        mailHost: string;
        mailPort: number;
        mailUser: string;
        mailPassword: string;
    };
}>;
export default _default;
export { mcpConfig };
