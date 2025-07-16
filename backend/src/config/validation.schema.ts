import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // Application Configuration
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().port().default(3000),
  API_PREFIX: Joi.string().default('api'),

  // Database Configuration
  DATABASE_TYPE: Joi.string().valid('postgres', 'mysql', 'sqlite').default('postgres'),
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().port().default(5432),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_URL: Joi.string().optional(),

  // Redis Configuration
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),
  REDIS_PASSWORD: Joi.string().optional(),
  REDIS_URL: Joi.string().optional(),

  // JWT Configuration
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRATION: Joi.string().default('24h'),

  // CORS Configuration
  CORS_ORIGIN: Joi.string().default('http://localhost:3001'),
  CORS_CREDENTIALS: Joi.string().valid('true', 'false').default('true'),
  CORS_METHODS: Joi.string().default('GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS'),
  CORS_HEADERS: Joi.string().default('Content-Type,Authorization,X-Requested-With'),

  // Logging Configuration
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  LOG_FORMAT: Joi.string().valid('combined', 'common', 'dev', 'short', 'tiny').default('combined'),
  LOG_FILE_PATH: Joi.string().default('./logs/lif3.log'),
  LOG_MAX_SIZE: Joi.string().default('10m'),
  LOG_MAX_FILES: Joi.string().default('5'),

  // Security Configuration
  RATE_LIMIT_WINDOW: Joi.number().positive().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().positive().default(100),
  HELMET_CONTENT_SECURITY_POLICY: Joi.string().valid('true', 'false').default('true'),
  HELMET_HSTS_MAX_AGE: Joi.number().positive().default(31536000),

  // External API Configuration - Sentry
  SENTRY_DSN: Joi.string().uri().optional(),
  SENTRY_AUTH_TOKEN: Joi.string().optional(),
  SENTRY_ORG: Joi.string().optional(),
  SENTRY_PROJECT: Joi.string().optional(),

  // External API Configuration - Notion
  NOTION_API_TOKEN: Joi.string().pattern(/^secret_/).optional(),
  NOTION_LIF3_DATABASE_ID: Joi.string().optional(),
  NOTION_NET_WORTH_GOAL_ID: Joi.string().optional(),

  // External API Configuration - Asana
  ASANA_ACCESS_TOKEN: Joi.string().optional(),
  ASANA_LIF3_PROJECT_ID: Joi.string().optional(),
  ASANA_ERROR_PROJECT_ID: Joi.string().optional(),
  ASANA_WORKSPACE_ID: Joi.string().optional(),

  // External API Configuration - Claude AI
  ANTHROPIC_API_KEY: Joi.string().optional(),
  CLAUDE_MODEL: Joi.string().default('claude-3-sonnet-20240229'),
  CLAUDE_MAX_TOKENS: Joi.number().positive().default(4000),

  // External API Configuration - Google Drive
  GOOGLE_DRIVE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_DRIVE_CLIENT_SECRET: Joi.string().optional(),
  GOOGLE_DRIVE_REFRESH_TOKEN: Joi.string().optional(),
  GOOGLE_DRIVE_FOLDER_ID: Joi.string().optional(),

  // External API Configuration - Discord
  DISCORD_BOT_TOKEN: Joi.string().optional(),
  DISCORD_CHANNEL_ID: Joi.string().optional(),

  // South African Banking APIs
  NEDBANK_API_KEY: Joi.string().optional(),
  NEDBANK_CLIENT_ID: Joi.string().optional(),
  NEDBANK_CLIENT_SECRET: Joi.string().optional(),
  OKRA_SECRET_KEY: Joi.string().optional(),
  OKRA_PUBLIC_KEY: Joi.string().optional(),

  // Market Data APIs
  ALPHA_VANTAGE_API_KEY: Joi.string().optional(),
  FINNHUB_API_KEY: Joi.string().optional(),

  // Financial Targets
  NET_WORTH_TARGET: Joi.number().positive().default(1800000),
  BUSINESS_DAILY_REVENUE_TARGET: Joi.number().positive().default(4881),
  BUSINESS_MRR_TARGET: Joi.number().positive().default(147917),

  // AI Configuration
  AI_BRIEFING_SCHEDULE: Joi.string().default('0 8 * * *'),
  AI_GOAL_CHECK_INTERVAL: Joi.string().default('6h'),
  AI_REVENUE_TRACKING_INTERVAL: Joi.string().default('1h'),
  AI_EXPENSE_ANALYSIS_INTERVAL: Joi.string().default('24h'),

  // MCP Framework Configuration
  MCP_LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  MCP_HEALTH_CHECK_INTERVAL: Joi.number().positive().default(30000),
  MCP_SYNC_TIMEOUT: Joi.number().positive().default(60000),
  MCP_MAX_RETRIES: Joi.number().positive().default(3),
  MCP_CIRCUIT_BREAKER_THRESHOLD: Joi.number().positive().default(5),
  MCP_BATCH_SIZE: Joi.number().positive().default(100),
  MCP_CACHE_TIMEOUT: Joi.number().positive().default(300000),
  MCP_ENCRYPTION_KEY: Joi.string().optional(),

  // WebSocket Configuration
  WEBSOCKET_PORT: Joi.number().port().default(3001),
  WEBSOCKET_CORS_ORIGIN: Joi.string().default('http://localhost:3000'),

  // Webhook Configuration
  WEBHOOK_SECRET: Joi.string().optional(),

  // Monitoring Configuration
  ENABLE_PERFORMANCE_MONITORING: Joi.string().valid('true', 'false').default('true'),
  PERFORMANCE_SAMPLE_RATE: Joi.number().min(0).max(1).default(0.1),

  // Backup Configuration
  BACKUP_SCHEDULE: Joi.string().default('0 2 * * *'),
  BACKUP_RETENTION_DAYS: Joi.number().positive().default(30),
  BACKUP_S3_BUCKET: Joi.string().optional(),
  BACKUP_S3_REGION: Joi.string().optional(),

  // Testing Configuration
  TEST_DATABASE_URL: Joi.string().default('sqlite:./test.db'),
  MAIL_HOST: Joi.string().default('localhost'),
  MAIL_PORT: Joi.number().port().default(1025),
  MAIL_USER: Joi.string().default('test'),
  MAIL_PASSWORD: Joi.string().default('test'),

  // GitHub Integration (optional)
  GITHUB_ACCESS_TOKEN: Joi.string().optional(),
  GITHUB_OWNER: Joi.string().optional(),
  GITHUB_REPO: Joi.string().optional(),

  // Slack Integration (optional)
  SLACK_BOT_TOKEN: Joi.string().optional(),
  SLACK_CHANNEL_ID: Joi.string().optional(),

  // Cloudflare Integration (optional)
  CLOUDFLARE_API_TOKEN: Joi.string().optional(),
  CLOUDFLARE_ZONE_ID: Joi.string().optional(),

  // Canva Integration (optional)
  CANVA_API_KEY: Joi.string().optional(),
  CANVA_BRAND_ID: Joi.string().optional(),
}).options({
  allowUnknown: true, // Allow additional environment variables
  stripUnknown: false, // Don't remove unknown keys
});