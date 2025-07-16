import { registerAs } from '@nestjs/config';

export default registerAs('mcp', () => ({
  // Framework Configuration
  logLevel: process.env.MCP_LOG_LEVEL || 'info',
  healthCheckInterval: parseInt(process.env.MCP_HEALTH_CHECK_INTERVAL || '30000'),
  syncTimeout: parseInt(process.env.MCP_SYNC_TIMEOUT || '60000'),
  maxRetries: parseInt(process.env.MCP_MAX_RETRIES || '3'),
  circuitBreakerThreshold: parseInt(process.env.MCP_CIRCUIT_BREAKER_THRESHOLD || '5'),
  batchSize: parseInt(process.env.MCP_BATCH_SIZE || '100'),
  cacheTimeout: parseInt(process.env.MCP_CACHE_TIMEOUT || '300000'),

  // Server Configurations
  servers: {
    sentry: {
      id: 'sentry_server',
      name: 'Sentry MCP Server',
      description: 'Error tracking and monitoring integration',
      enabled: !!process.env.SENTRY_AUTH_TOKEN,
      config: {
        host: 'sentry.io',
        port: 443,
        apiKey: process.env.SENTRY_AUTH_TOKEN,
        timeout: 30000,
        maxRetries: 3,
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      },
    },
    notion: {
      id: 'notion_server',
      name: 'Notion MCP Server',
      description: 'Documentation and knowledge management integration',
      enabled: !!process.env.NOTION_API_TOKEN,
      config: {
        host: 'api.notion.com',
        port: 443,
        apiKey: process.env.NOTION_API_TOKEN,
        timeout: 30000,
        maxRetries: 3,
        databaseId: process.env.NOTION_LIF3_DATABASE_ID,
        netWorthGoalId: process.env.NOTION_NET_WORTH_GOAL_ID,
      },
    },
    asana: {
      id: 'asana_server',
      name: 'Asana MCP Server',
      description: 'Project management and task orchestration integration',
      enabled: !!process.env.ASANA_ACCESS_TOKEN,
      config: {
        host: 'app.asana.com',
        port: 443,
        apiKey: process.env.ASANA_ACCESS_TOKEN,
        timeout: 30000,
        maxRetries: 3,
        lif3ProjectId: process.env.ASANA_LIF3_PROJECT_ID,
        errorProjectId: process.env.ASANA_ERROR_PROJECT_ID,
        workspaceId: process.env.ASANA_WORKSPACE_ID,
      },
    },
    github: {
      id: 'github_server',
      name: 'GitHub MCP Server',
      description: 'Code management and deployment integration',
      enabled: !!process.env.GITHUB_ACCESS_TOKEN,
      config: {
        host: 'api.github.com',
        port: 443,
        apiKey: process.env.GITHUB_ACCESS_TOKEN,
        timeout: 30000,
        maxRetries: 3,
        owner: process.env.GITHUB_OWNER,
        repo: process.env.GITHUB_REPO,
      },
    },
    slack: {
      id: 'slack_server',
      name: 'Slack MCP Server',
      description: 'Team communication integration',
      enabled: !!process.env.SLACK_BOT_TOKEN,
      config: {
        host: 'slack.com',
        port: 443,
        apiKey: process.env.SLACK_BOT_TOKEN,
        timeout: 30000,
        maxRetries: 3,
        channel: process.env.SLACK_CHANNEL_ID,
      },
    },
    cloudflare: {
      id: 'cloudflare_server',
      name: 'Cloudflare MCP Server',
      description: 'Infrastructure monitoring and optimization',
      enabled: !!process.env.CLOUDFLARE_API_TOKEN,
      config: {
        host: 'api.cloudflare.com',
        port: 443,
        apiKey: process.env.CLOUDFLARE_API_TOKEN,
        timeout: 30000,
        maxRetries: 3,
        zoneId: process.env.CLOUDFLARE_ZONE_ID,
      },
    },
    canva: {
      id: 'canva_server',
      name: 'Canva MCP Server',
      description: 'Content creation and design automation',
      enabled: !!process.env.CANVA_API_KEY,
      config: {
        host: 'api.canva.com',
        port: 443,
        apiKey: process.env.CANVA_API_KEY,
        timeout: 30000,
        maxRetries: 3,
        brandId: process.env.CANVA_BRAND_ID,
      },
    },
  },

  // Integration Configurations
  integrations: {
    errorToTask: {
      id: 'error_to_task',
      name: 'Error to Task Automation',
      description: 'Automatically create Asana tasks from Sentry errors',
      enabled: true,
      autoSync: true,
      syncInterval: 300000, // 5 minutes
      mapping: {
        sourceFields: ['title', 'culprit', 'level', 'permalink'],
        targetFields: ['name', 'notes', 'priority', 'external_url'],
        transformations: [
          {
            type: 'map',
            sourceField: 'level',
            targetField: 'priority',
            expression: JSON.stringify({
              'fatal': 'high',
              'error': 'high',
              'warning': 'medium',
              'info': 'low',
            }),
          },
          {
            type: 'format',
            sourceField: 'title',
            targetField: 'name',
            expression: '[ERROR] {value}',
          },
        ],
      },
    },
    goalTracking: {
      id: 'goal_tracking',
      name: 'Goal Progress Tracking',
      description: 'Synchronize financial goal progress across platforms',
      enabled: true,
      autoSync: true,
      syncInterval: 600000, // 10 minutes
      mapping: {
        sourceFields: ['current_amount', 'target_amount', 'progress'],
        targetFields: ['Current Amount', 'Target Amount', 'Progress'],
        transformations: [
          {
            type: 'calculate',
            sourceField: 'current_amount',
            targetField: 'progress',
            expression: '(current_amount / target_amount) * 100',
          },
        ],
      },
    },
    businessMetrics: {
      id: 'business_metrics',
      name: 'Business Metrics Sync',
      description: 'Synchronize 43V3R business metrics across platforms',
      enabled: true,
      autoSync: true,
      syncInterval: 180000, // 3 minutes
      mapping: {
        sourceFields: ['daily_revenue', 'mrr', 'customer_count'],
        targetFields: ['Daily Revenue', 'MRR', 'Customer Count'],
        transformations: [
          {
            type: 'format',
            sourceField: 'daily_revenue',
            targetField: 'Daily Revenue',
            expression: 'R{value}',
          },
          {
            type: 'format',
            sourceField: 'mrr',
            targetField: 'MRR',
            expression: 'R{value}',
          },
        ],
      },
    },
    documentationSync: {
      id: 'documentation_sync',
      name: 'Documentation Synchronization',
      description: 'Keep documentation updated across platforms',
      enabled: true,
      autoSync: true,
      syncInterval: 1800000, // 30 minutes
      mapping: {
        sourceFields: ['title', 'content', 'category', 'last_updated'],
        targetFields: ['Name', 'Content', 'Category', 'Last Updated'],
        transformations: [
          {
            type: 'format',
            sourceField: 'last_updated',
            targetField: 'Last Updated',
            expression: 'ISO date format',
          },
        ],
      },
    },
  },

  // Automation Rules
  automationRules: {
    dailyBriefing: {
      enabled: true,
      schedule: process.env.AI_BRIEFING_SCHEDULE || '0 8 * * *',
      actions: ['generate_briefing', 'send_notifications', 'update_dashboard'],
    },
    goalMonitoring: {
      enabled: true,
      interval: process.env.AI_GOAL_CHECK_INTERVAL || '6h',
      actions: ['check_progress', 'generate_insights', 'create_tasks'],
    },
    revenueTracking: {
      enabled: true,
      interval: process.env.AI_REVENUE_TRACKING_INTERVAL || '1h',
      actions: ['track_revenue', 'update_metrics', 'check_targets'],
    },
    expenseAnalysis: {
      enabled: true,
      interval: process.env.AI_EXPENSE_ANALYSIS_INTERVAL || '24h',
      actions: ['analyze_expenses', 'identify_savings', 'generate_reports'],
    },
  },

  // Performance Optimization
  performance: {
    enableCaching: true,
    cacheTimeout: parseInt(process.env.MCP_CACHE_TIMEOUT || '300000'),
    enableBatching: true,
    batchSize: parseInt(process.env.MCP_BATCH_SIZE || '100'),
    maxConcurrentSyncs: 5,
    enableCircuitBreaker: true,
    circuitBreakerThreshold: parseInt(process.env.MCP_CIRCUIT_BREAKER_THRESHOLD || '5'),
  },

  // Security Configuration
  security: {
    enableRateLimiting: true,
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    enableEncryption: true,
    encryptionKey: process.env.MCP_ENCRYPTION_KEY || process.env.JWT_SECRET,
    enableAuditLogging: true,
  },

  // Webhook Configuration
  webhooks: {
    enabled: true,
    secret: process.env.WEBHOOK_SECRET,
    endpoints: {
      sentry: '/webhooks/sentry',
      asana: '/webhooks/asana',
      notion: '/webhooks/notion',
      github: '/webhooks/github',
    },
  },

  // Financial Targets (for goal tracking)
  financialTargets: {
    netWorthTarget: parseInt(process.env.NET_WORTH_TARGET || '1800000'),
    dailyRevenueTarget: parseInt(process.env.BUSINESS_DAILY_REVENUE_TARGET || '4881'),
    mrrTarget: parseInt(process.env.BUSINESS_MRR_TARGET || '147917'),
  },

  // Error Handling
  errorHandling: {
    enableRetry: true,
    maxRetries: parseInt(process.env.MCP_MAX_RETRIES || '3'),
    retryDelay: 1000,
    enableFallback: true,
    fallbackMode: 'degraded',
    enableNotifications: true,
    notificationChannels: ['email', 'slack', 'discord'],
  },
}));