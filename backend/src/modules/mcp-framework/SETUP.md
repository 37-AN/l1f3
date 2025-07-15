# LIF3 MCP Framework Setup Guide

## Quick Start

### 1. Environment Setup

Create a `.env` file in your backend directory:

```bash
# Sentry Integration
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your_organization_slug
SENTRY_PROJECT=lif3-backend

# Notion Integration
NOTION_API_TOKEN=your_notion_integration_token
NOTION_LIF3_DATABASE_ID=your_lif3_database_id

# Asana Integration
ASANA_ACCESS_TOKEN=your_asana_personal_access_token
ASANA_LIF3_PROJECT_ID=your_lif3_project_id
ASANA_ERROR_PROJECT_ID=your_error_handling_project_id
```

### 2. Module Registration

Add the MCP framework to your main app module:

```typescript
// src/app.module.ts
import { MCPFrameworkModule } from './modules/mcp-framework/mcp-framework.module';

@Module({
  imports: [
    // ... other modules
    MCPFrameworkModule,
  ],
  // ... rest of module configuration
})
export class AppModule {}
```

### 3. Initialize MCP Servers

```typescript
// src/main.ts or dedicated initialization service
import { MCPFrameworkService } from './modules/mcp-framework/mcp-framework.service';
import { SentryMCPServer } from './modules/mcp-servers/sentry-mcp-server';
import { NotionMCPServer } from './modules/mcp-servers/notion-mcp-server';
import { AsanaMCPServer } from './modules/mcp-servers/asana-mcp-server';

async function initializeMCPFramework(app: INestApplication) {
  const mcpService = app.get(MCPFrameworkService);
  
  // Initialize MCP servers
  const sentryServer = new SentryMCPServer();
  const notionServer = new NotionMCPServer();
  const asanaServer = new AsanaMCPServer();
  
  // Register servers
  await mcpService.registerServer(sentryServer.getServerConfig());
  await mcpService.registerServer(notionServer.getServerConfig());
  await mcpService.registerServer(asanaServer.getServerConfig());
  
  // Register integrations
  await mcpService.registerIntegration({
    serverId: 'sentry_server',
    name: 'Error Tracking',
    description: 'Monitor and track application errors',
    enabled: true,
    autoSync: true,
    syncInterval: 300000, // 5 minutes
  });
  
  await mcpService.registerIntegration({
    serverId: 'notion_server',
    name: 'Documentation Management',
    description: 'Manage LIF3 documentation and knowledge base',
    enabled: true,
    autoSync: true,
    syncInterval: 600000, // 10 minutes
  });
  
  await mcpService.registerIntegration({
    serverId: 'asana_server',
    name: 'Task Management',
    description: 'Manage LIF3 project tasks and workflows',
    enabled: true,
    autoSync: true,
    syncInterval: 180000, // 3 minutes
  });
  
  console.log('✅ MCP Framework initialized successfully');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Initialize MCP Framework
  await initializeMCPFramework(app);
  
  await app.listen(3000);
}
```

## Detailed Configuration

### Sentry Setup

1. **Create Sentry Integration:**
   - Go to Sentry Settings → Integrations
   - Create a new Internal Integration
   - Grant required permissions: `project:read`, `event:read`, `issue:write`
   - Copy the Auth Token

2. **Configure Sentry Server:**
   ```typescript
   const sentryConfig = {
     authToken: process.env.SENTRY_AUTH_TOKEN,
     organization: process.env.SENTRY_ORG,
     project: process.env.SENTRY_PROJECT,
     webhookUrl: 'https://your-domain.com/api/webhooks/sentry',
   };
   ```

### Notion Setup

1. **Create Notion Integration:**
   - Go to https://www.notion.so/my-integrations
   - Create a new integration
   - Copy the Internal Integration Token
   - Share your LIF3 database with the integration

2. **Set up LIF3 Database:**
   Create a database with these properties:
   - Name (Title)
   - Category (Select): System Updates, Goals, Tasks, Documentation
   - Status (Select): Active, Completed, Archived
   - Created Date (Date)
   - Progress (Number): For goal tracking

### Asana Setup

1. **Create Personal Access Token:**
   - Go to Asana Settings → Apps → Developer Apps
   - Create a new Personal Access Token
   - Copy the token

2. **Set up Projects:**
   - Create a main LIF3 project for general tasks
   - Create an error handling project for automated error tasks
   - Copy the project GIDs

## Integration Patterns

### Error-to-Task Automation

```typescript
// Automatic error task creation
export class ErrorToTaskService {
  constructor(private readonly mcpService: MCPFrameworkService) {}

  async handleError(error: any) {
    // Create Sentry issue
    const sentryResponse = await this.mcpService.sendMessage('sentry_server', {
      jsonrpc: '2.0',
      id: 'create_issue',
      method: 'create_issue',
      params: {
        project: process.env.SENTRY_PROJECT,
        title: error.message,
        description: error.stack,
        level: 'error',
      },
    });

    // Create Asana task
    const asanaResponse = await this.mcpService.sendMessage('asana_server', {
      jsonrpc: '2.0',
      id: 'create_task',
      method: 'create_task',
      params: {
        name: `[ERROR] ${error.message}`,
        notes: `Sentry Issue: ${sentryResponse.result.issue.permalink}\\n\\nStack Trace:\\n${error.stack}`,
        project_id: process.env.ASANA_ERROR_PROJECT_ID,
        priority: 'high',
      },
    });

    // Update Notion documentation
    const notionResponse = await this.mcpService.sendMessage('notion_server', {
      jsonrpc: '2.0',
      id: 'create_page',
      method: 'create_page',
      params: {
        parent: {
          database_id: process.env.NOTION_LIF3_DATABASE_ID,
        },
        properties: {
          Name: {
            title: [{ text: { content: `Error Report: ${error.message}` } }],
          },
          Category: {
            select: { name: 'System Updates' },
          },
          Status: {
            select: { name: 'Active' },
          },
        },
      },
    });

    return {
      sentryIssue: sentryResponse.result,
      asanaTask: asanaResponse.result,
      notionPage: notionResponse.result,
    };
  }
}
```

### Goal Progress Synchronization

```typescript
// Financial goal tracking across platforms
export class GoalProgressService {
  constructor(private readonly mcpService: MCPFrameworkService) {}

  async updateNetWorthProgress(currentAmount: number, targetAmount: number = 1800000) {
    const progress = (currentAmount / targetAmount) * 100;
    
    // Update Notion goal database
    await this.mcpService.sendMessage('notion_server', {
      jsonrpc: '2.0',
      id: 'update_goal',
      method: 'update_page',
      params: {
        page_id: process.env.NOTION_NET_WORTH_GOAL_ID,
        properties: {
          Progress: { number: progress },
          'Current Amount': { number: currentAmount },
          'Last Updated': { date: { start: new Date().toISOString() } },
        },
      },
    });

    // Create Asana task if behind target
    if (progress < this.getExpectedProgress()) {
      await this.mcpService.sendMessage('asana_server', {
        jsonrpc: '2.0',
        id: 'create_task',
        method: 'create_task',
        params: {
          name: 'Review Financial Strategy - Behind Target',
          notes: `Current: R${currentAmount.toLocaleString()}\\nTarget: R${targetAmount.toLocaleString()}\\nProgress: ${progress.toFixed(1)}%`,
          project_id: process.env.ASANA_LIF3_PROJECT_ID,
          priority: 'high',
          due_on: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
      });
    }
  }

  private getExpectedProgress(): number {
    // Calculate expected progress based on timeline
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2025-12-31');
    const now = new Date();
    
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return (elapsedDays / totalDays) * 100;
  }
}
```

## Testing Setup

### Unit Tests

```bash
# Install test dependencies
npm install --save-dev @nestjs/testing jest ts-jest

# Run MCP framework tests
npm test -- --testPathPattern="mcp-framework"
```

### Integration Tests

```typescript
// src/modules/mcp-framework/tests/integration.test.ts
describe('MCP Framework Integration Tests', () => {
  let app: INestApplication;
  let mcpService: MCPFrameworkService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [MCPFrameworkModule],
    }).compile();

    app = moduleRef.createNestApplication();
    mcpService = app.get(MCPFrameworkService);
    await app.init();
  });

  it('should connect to all MCP servers', async () => {
    const servers = mcpService.getServers();
    
    for (const server of servers) {
      const response = await mcpService.sendMessage(server.id, {
        jsonrpc: '2.0',
        id: 'test_ping',
        method: 'ping',
        params: {},
      });
      
      expect(response.result).toBe('pong');
    }
  });

  it('should sync all integrations', async () => {
    const results = await mcpService.syncAllIntegrations();
    
    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
    
    for (const result of results) {
      expect(result.success).toBe(true);
    }
  });
});
```

## Monitoring and Debugging

### Health Checks

```typescript
// Add health check endpoint
@Controller('health')
export class HealthController {
  constructor(private readonly mcpService: MCPFrameworkService) {}

  @Get('mcp')
  async checkMCPHealth() {
    const servers = this.mcpService.getServers();
    const status = {};

    for (const server of servers) {
      try {
        const response = await this.mcpService.sendMessage(server.id, {
          jsonrpc: '2.0',
          id: 'health_check',
          method: 'ping',
          params: {},
        });
        
        status[server.id] = {
          name: server.name,
          status: response.result === 'pong' ? 'healthy' : 'unhealthy',
          lastCheck: new Date().toISOString(),
        };
      } catch (error) {
        status[server.id] = {
          name: server.name,
          status: 'error',
          error: error.message,
          lastCheck: new Date().toISOString(),
        };
      }
    }

    return {
      mcp: {
        status: Object.values(status).every(s => s.status === 'healthy') ? 'healthy' : 'degraded',
        servers: status,
      },
    };
  }
}
```

### Logging

```typescript
// Configure detailed logging
import { Logger } from '@nestjs/common';

const logger = new Logger('MCPFramework');

// Log all MCP operations
logger.log('MCP server registered', { serverId: server.id, name: server.name });
logger.warn('MCP sync failed', { integrationId, error: error.message });
logger.error('MCP connection lost', { serverId, error });
```

## Production Deployment

### Environment Variables

```bash
# Production .env
NODE_ENV=production
MCP_LOG_LEVEL=info
MCP_HEALTH_CHECK_INTERVAL=30000
MCP_SYNC_TIMEOUT=60000
MCP_MAX_RETRIES=3
MCP_CIRCUIT_BREAKER_THRESHOLD=5
```

### Docker Configuration

```dockerfile
# Dockerfile additions for MCP
ENV MCP_HEALTH_CHECK_INTERVAL=30000
ENV MCP_SYNC_TIMEOUT=60000

# Copy MCP configuration
COPY src/modules/mcp-framework ./src/modules/mcp-framework
COPY src/modules/mcp-servers ./src/modules/mcp-servers
```

### Performance Tuning

```typescript
// Production optimizations
const mcpConfig = {
  maxConcurrentSyncs: 5,
  batchSize: 100,
  cacheTimeout: 300000, // 5 minutes
  connectionPoolSize: 10,
  healthCheckInterval: 30000,
  syncTimeout: 60000,
};
```

## Troubleshooting

### Common Issues

1. **Connection Timeout:**
   - Check network connectivity
   - Verify API tokens
   - Increase timeout values

2. **Sync Failures:**
   - Check data mapping configuration
   - Verify field types and formats
   - Review transformation expressions

3. **High Memory Usage:**
   - Reduce batch sizes
   - Increase sync intervals
   - Enable garbage collection

### Debug Commands

```bash
# Check server connections
curl http://localhost:3000/health/mcp

# Test specific integration
curl -X POST http://localhost:3000/api/mcp/test/sentry_server

# Force sync all integrations
curl -X POST http://localhost:3000/api/mcp/sync/all
```

## Support

For additional support:
- Check the main README.md for detailed documentation
- Review error logs in the monitoring dashboard
- Contact system administrator for production issues

---

*Setup guide version 1.0.0 - Last updated: 2025-07-15*