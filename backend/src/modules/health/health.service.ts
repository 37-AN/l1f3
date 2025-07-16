import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConnectionTester } from '../../scripts/test-connections';
import { MCPInitializationService } from '../mcp-framework/mcp-initialization.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mcpInitService: MCPInitializationService,
  ) {}

  async checkHealth() {
    const mcpHealth = await this.mcpInitService.getHealthStatus();
    const financialTargets = this.mcpInitService.getFinancialTargets();
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: this.configService.get('NODE_ENV', 'development'),
      timezone: this.configService.get('TZ', 'Africa/Johannesburg'),
      unifiedAI: {
        netWorth: `R0 → R${financialTargets.netWorthTarget.toLocaleString()}`,
        business: `43V3R R0 → R${financialTargets.dailyRevenueTarget} daily`,
        mrr: `Target: R${financialTargets.mrrTarget.toLocaleString()}`,
        automation: 'MCP Framework Active',
        performance: '30% faster, 25% savings, 90% automation'
      },
      mcp: mcpHealth
    };
  }

  async checkDetailedHealth() {
    const basic = await this.checkHealth();
    
    return {
      ...basic,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        }
      },
      configuration: {
        database: !!this.configService.get('DATABASE_URL'),
        redis: !!this.configService.get('REDIS_URL'),
        googleDrive: !!this.configService.get('GOOGLE_CLIENT_ID'),
        discord: !!this.configService.get('DISCORD_BOT_TOKEN'),
        claude: !!this.configService.get('CLAUDE_API_KEY'),
        email: !!this.configService.get('SMTP_USER'),
        mcp: {
          sentry: !!this.configService.get('SENTRY_AUTH_TOKEN'),
          notion: !!this.configService.get('NOTION_API_TOKEN'),
          asana: !!this.configService.get('ASANA_ACCESS_TOKEN'),
          github: !!this.configService.get('GITHUB_ACCESS_TOKEN'),
          slack: !!this.configService.get('SLACK_BOT_TOKEN')
        }
      }
    };
  }

  async checkConnectionStatus() {
    const tester = new ConnectionTester();
    const results = await tester.runAllTests();
    
    const summary = {
      total: results.length,
      successful: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'skipped').length
    };

    return {
      summary,
      connections: results,
      overall: summary.failed === 0 ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString()
    };
  }

  async checkMCPHealth() {
    try {
      const mcpHealth = await this.mcpInitService.getHealthStatus();
      
      return {
        status: 'healthy',
        framework: mcpHealth,
        targets: this.mcpInitService.getFinancialTargets(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async triggerMCPSync() {
    try {
      const result = await this.mcpInitService.triggerFullSync();
      return {
        status: 'success',
        ...result
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}