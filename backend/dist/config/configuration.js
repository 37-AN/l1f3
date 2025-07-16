"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcpConfig = void 0;
const config_1 = require("@nestjs/config");
const mcp_config_1 = __importDefault(require("./mcp.config"));
exports.mcpConfig = mcp_config_1.default;
exports.default = (0, config_1.registerAs)('app', () => ({
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000'),
    apiPrefix: process.env.API_PREFIX || 'api',
    database: {
        type: process.env.DATABASE_TYPE || 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USERNAME || 'lif3_user',
        password: process.env.DATABASE_PASSWORD || 'password',
        database: process.env.DATABASE_NAME || 'lif3_db',
        url: process.env.DATABASE_URL,
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        url: process.env.REDIS_URL,
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRATION || '24h',
    },
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
        credentials: process.env.CORS_CREDENTIALS === 'true',
        methods: process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: process.env.CORS_HEADERS || 'Content-Type,Authorization,X-Requested-With',
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'combined',
        filePath: process.env.LOG_FILE_PATH || './logs/lif3.log',
        maxSize: process.env.LOG_MAX_SIZE || '10m',
        maxFiles: process.env.LOG_MAX_FILES || '5',
    },
    security: {
        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'),
            max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
        },
        helmet: {
            contentSecurityPolicy: process.env.HELMET_CONTENT_SECURITY_POLICY === 'true',
            hstsMaxAge: parseInt(process.env.HELMET_HSTS_MAX_AGE || '31536000'),
        },
    },
    externalApis: {
        sentry: {
            dsn: process.env.SENTRY_DSN,
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: process.env.SENTRY_ORG,
            project: process.env.SENTRY_PROJECT,
        },
        notion: {
            apiToken: process.env.NOTION_API_TOKEN,
            databaseId: process.env.NOTION_LIF3_DATABASE_ID,
            netWorthGoalId: process.env.NOTION_NET_WORTH_GOAL_ID,
        },
        asana: {
            accessToken: process.env.ASANA_ACCESS_TOKEN,
            lif3ProjectId: process.env.ASANA_LIF3_PROJECT_ID,
            errorProjectId: process.env.ASANA_ERROR_PROJECT_ID,
            workspaceId: process.env.ASANA_WORKSPACE_ID,
        },
        claude: {
            apiKey: process.env.ANTHROPIC_API_KEY,
            model: process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229',
            maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS || '4000'),
        },
        googleDrive: {
            clientId: process.env.GOOGLE_DRIVE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
            folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
        },
        discord: {
            botToken: process.env.DISCORD_BOT_TOKEN,
            channelId: process.env.DISCORD_CHANNEL_ID,
        },
        nedbank: {
            apiKey: process.env.NEDBANK_API_KEY,
            clientId: process.env.NEDBANK_CLIENT_ID,
            clientSecret: process.env.NEDBANK_CLIENT_SECRET,
        },
        okra: {
            secretKey: process.env.OKRA_SECRET_KEY,
            publicKey: process.env.OKRA_PUBLIC_KEY,
        },
        alphaVantage: {
            apiKey: process.env.ALPHA_VANTAGE_API_KEY,
        },
        finnhub: {
            apiKey: process.env.FINNHUB_API_KEY,
        },
    },
    financialTargets: {
        netWorthTarget: parseInt(process.env.NET_WORTH_TARGET || '1800000'),
        dailyRevenueTarget: parseInt(process.env.BUSINESS_DAILY_REVENUE_TARGET || '4881'),
        mrrTarget: parseInt(process.env.BUSINESS_MRR_TARGET || '147917'),
    },
    ai: {
        briefingSchedule: process.env.AI_BRIEFING_SCHEDULE || '0 8 * * *',
        goalCheckInterval: process.env.AI_GOAL_CHECK_INTERVAL || '6h',
        revenueTrackingInterval: process.env.AI_REVENUE_TRACKING_INTERVAL || '1h',
        expenseAnalysisInterval: process.env.AI_EXPENSE_ANALYSIS_INTERVAL || '24h',
    },
    websocket: {
        port: parseInt(process.env.WEBSOCKET_PORT || '3001'),
        corsOrigin: process.env.WEBSOCKET_CORS_ORIGIN || 'http://localhost:3000',
    },
    monitoring: {
        enablePerformanceMonitoring: process.env.ENABLE_PERFORMANCE_MONITORING === 'true',
        performanceSampleRate: parseFloat(process.env.PERFORMANCE_SAMPLE_RATE || '0.1'),
    },
    backup: {
        schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *',
        retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
        s3Bucket: process.env.BACKUP_S3_BUCKET,
        s3Region: process.env.BACKUP_S3_REGION,
    },
    testing: {
        databaseUrl: process.env.TEST_DATABASE_URL || 'sqlite:./test.db',
        mailHost: process.env.MAIL_HOST || 'localhost',
        mailPort: parseInt(process.env.MAIL_PORT || '1025'),
        mailUser: process.env.MAIL_USER || 'test',
        mailPassword: process.env.MAIL_PASSWORD || 'test',
    },
}));
//# sourceMappingURL=configuration.js.map