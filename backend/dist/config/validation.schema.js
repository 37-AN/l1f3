"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.configValidationSchema = void 0;
const Joi = __importStar(require("joi"));
exports.configValidationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().port().default(3000),
    API_PREFIX: Joi.string().default('api'),
    DATABASE_TYPE: Joi.string().valid('postgres', 'mysql', 'sqlite').default('postgres'),
    DATABASE_HOST: Joi.string().default('localhost'),
    DATABASE_PORT: Joi.number().port().default(5432),
    DATABASE_USERNAME: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
    DATABASE_URL: Joi.string().optional(),
    REDIS_HOST: Joi.string().default('localhost'),
    REDIS_PORT: Joi.number().port().default(6379),
    REDIS_PASSWORD: Joi.string().optional(),
    REDIS_URL: Joi.string().optional(),
    JWT_SECRET: Joi.string().min(32).required(),
    JWT_EXPIRATION: Joi.string().default('24h'),
    CORS_ORIGIN: Joi.string().default('http://localhost:3001'),
    CORS_CREDENTIALS: Joi.string().valid('true', 'false').default('true'),
    CORS_METHODS: Joi.string().default('GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'),
    CORS_HEADERS: Joi.string().default('Content-Type,Authorization,X-Requested-With'),
    LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
    LOG_FORMAT: Joi.string().valid('combined', 'common', 'dev', 'short', 'tiny').default('combined'),
    LOG_FILE_PATH: Joi.string().default('./logs/lif3.log'),
    LOG_MAX_SIZE: Joi.string().default('10m'),
    LOG_MAX_FILES: Joi.string().default('5'),
    RATE_LIMIT_WINDOW: Joi.number().positive().default(900000),
    RATE_LIMIT_MAX_REQUESTS: Joi.number().positive().default(100),
    HELMET_CONTENT_SECURITY_POLICY: Joi.string().valid('true', 'false').default('true'),
    HELMET_HSTS_MAX_AGE: Joi.number().positive().default(31536000),
    SENTRY_DSN: Joi.string().uri().optional(),
    SENTRY_AUTH_TOKEN: Joi.string().optional(),
    SENTRY_ORG: Joi.string().optional(),
    SENTRY_PROJECT: Joi.string().optional(),
    NOTION_API_TOKEN: Joi.string().pattern(/^secret_/).optional(),
    NOTION_LIF3_DATABASE_ID: Joi.string().optional(),
    NOTION_NET_WORTH_GOAL_ID: Joi.string().optional(),
    ASANA_ACCESS_TOKEN: Joi.string().optional(),
    ASANA_LIF3_PROJECT_ID: Joi.string().optional(),
    ASANA_ERROR_PROJECT_ID: Joi.string().optional(),
    ASANA_WORKSPACE_ID: Joi.string().optional(),
    ANTHROPIC_API_KEY: Joi.string().optional(),
    CLAUDE_MODEL: Joi.string().default('claude-3-sonnet-20240229'),
    CLAUDE_MAX_TOKENS: Joi.number().positive().default(4000),
    GOOGLE_DRIVE_CLIENT_ID: Joi.string().optional(),
    GOOGLE_DRIVE_CLIENT_SECRET: Joi.string().optional(),
    GOOGLE_DRIVE_REFRESH_TOKEN: Joi.string().optional(),
    GOOGLE_DRIVE_FOLDER_ID: Joi.string().optional(),
    DISCORD_BOT_TOKEN: Joi.string().optional(),
    DISCORD_CHANNEL_ID: Joi.string().optional(),
    NEDBANK_API_KEY: Joi.string().optional(),
    NEDBANK_CLIENT_ID: Joi.string().optional(),
    NEDBANK_CLIENT_SECRET: Joi.string().optional(),
    OKRA_SECRET_KEY: Joi.string().optional(),
    OKRA_PUBLIC_KEY: Joi.string().optional(),
    ALPHA_VANTAGE_API_KEY: Joi.string().optional(),
    FINNHUB_API_KEY: Joi.string().optional(),
    NET_WORTH_TARGET: Joi.number().positive().default(1800000),
    BUSINESS_DAILY_REVENUE_TARGET: Joi.number().positive().default(4881),
    BUSINESS_MRR_TARGET: Joi.number().positive().default(147917),
    AI_BRIEFING_SCHEDULE: Joi.string().default('0 8 * * *'),
    AI_GOAL_CHECK_INTERVAL: Joi.string().default('6h'),
    AI_REVENUE_TRACKING_INTERVAL: Joi.string().default('1h'),
    AI_EXPENSE_ANALYSIS_INTERVAL: Joi.string().default('24h'),
    MCP_LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
    MCP_HEALTH_CHECK_INTERVAL: Joi.number().positive().default(30000),
    MCP_SYNC_TIMEOUT: Joi.number().positive().default(60000),
    MCP_MAX_RETRIES: Joi.number().positive().default(3),
    MCP_CIRCUIT_BREAKER_THRESHOLD: Joi.number().positive().default(5),
    MCP_BATCH_SIZE: Joi.number().positive().default(100),
    MCP_CACHE_TIMEOUT: Joi.number().positive().default(300000),
    MCP_ENCRYPTION_KEY: Joi.string().optional(),
    WEBSOCKET_PORT: Joi.number().port().default(3001),
    WEBSOCKET_CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
    WEBHOOK_SECRET: Joi.string().optional(),
    ENABLE_PERFORMANCE_MONITORING: Joi.string().valid('true', 'false').default('true'),
    PERFORMANCE_SAMPLE_RATE: Joi.number().min(0).max(1).default(0.1),
    BACKUP_SCHEDULE: Joi.string().default('0 2 * * *'),
    BACKUP_RETENTION_DAYS: Joi.number().positive().default(30),
    BACKUP_S3_BUCKET: Joi.string().optional(),
    BACKUP_S3_REGION: Joi.string().optional(),
    TEST_DATABASE_URL: Joi.string().default('sqlite:./test.db'),
    MAIL_HOST: Joi.string().default('localhost'),
    MAIL_PORT: Joi.number().port().default(1025),
    MAIL_USER: Joi.string().default('test'),
    MAIL_PASSWORD: Joi.string().default('test'),
    GITHUB_ACCESS_TOKEN: Joi.string().optional(),
    GITHUB_OWNER: Joi.string().optional(),
    GITHUB_REPO: Joi.string().optional(),
    SLACK_BOT_TOKEN: Joi.string().optional(),
    SLACK_CHANNEL_ID: Joi.string().optional(),
    CLOUDFLARE_API_TOKEN: Joi.string().optional(),
    CLOUDFLARE_ZONE_ID: Joi.string().optional(),
    CANVA_API_KEY: Joi.string().optional(),
    CANVA_BRAND_ID: Joi.string().optional(),
}).options({
    allowUnknown: true,
    stripUnknown: false,
});
//# sourceMappingURL=validation.schema.js.map