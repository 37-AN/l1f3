import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MCPFrameworkService } from './mcp-framework.service';
import { SentryMCPServer } from '../mcp-servers/sentry-mcp-server';
import { NotionMCPServer } from '../mcp-servers/notion-mcp-server';
import { AsanaMCPServer } from '../mcp-servers/asana-mcp-server';

@Injectable()
export class MCPInitializationService implements OnModuleInit {
  private readonly logger = new Logger(MCPInitializationService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly mcpFrameworkService: MCPFrameworkService,
  ) {}

  async onModuleInit() {
    this.logger.log('🚀 Initializing LIF3 MCP Framework...');
    
    try {
      await this.initializeMCPServers();
      await this.registerIntegrations();
      await this.startAutomationRules();
      
      this.logger.log('✅ MCP Framework initialized successfully');
      this.logFrameworkStatus();
    } catch (error) {
      this.logger.error('❌ Failed to initialize MCP Framework:', error);
      throw error;
    }
  }

  private async initializeMCPServers(): Promise<void> {
    this.logger.log('🔧 Registering MCP servers...');
    
    const mcpConfig = this.configService.get('mcp');
    const serverPromises = [];

    // Initialize Sentry MCP Server
    if (mcpConfig.servers.sentry.enabled) {
      this.logger.log('📊 Initializing Sentry MCP Server...');
      const sentryServer = new SentryMCPServer();
      serverPromises.push(
        this.mcpFrameworkService.registerServer(sentryServer.getServerConfig())
      );
    }

    // Initialize Notion MCP Server
    if (mcpConfig.servers.notion.enabled) {
      this.logger.log('📚 Initializing Notion MCP Server...');
      const notionServer = new NotionMCPServer();
      serverPromises.push(
        this.mcpFrameworkService.registerServer(notionServer.getServerConfig())
      );
    }

    // Initialize Asana MCP Server
    if (mcpConfig.servers.asana.enabled) {
      this.logger.log('📋 Initializing Asana MCP Server...');
      const asanaServer = new AsanaMCPServer();
      serverPromises.push(
        this.mcpFrameworkService.registerServer(asanaServer.getServerConfig())
      );
    }

    // Wait for all servers to be registered
    await Promise.all(serverPromises);
    this.logger.log(`✅ Registered ${serverPromises.length} MCP servers`);
  }

  private async registerIntegrations(): Promise<void> {
    this.logger.log('🔗 Registering MCP integrations...');
    
    const mcpConfig = this.configService.get('mcp');
    const integrationPromises = [];

    // Register Error-to-Task Integration
    if (mcpConfig.integrations.errorToTask.enabled) {
      this.logger.log('⚠️  Registering Error-to-Task automation...');
      integrationPromises.push(
        this.mcpFrameworkService.registerIntegration({
          ...mcpConfig.integrations.errorToTask,
          serverId: 'sentry_server',
        })
      );
    }

    // Register Goal Tracking Integration
    if (mcpConfig.integrations.goalTracking.enabled) {
      this.logger.log('🎯 Registering Goal Tracking integration...');
      integrationPromises.push(
        this.mcpFrameworkService.registerIntegration({
          ...mcpConfig.integrations.goalTracking,
          serverId: 'notion_server',
        })
      );
    }

    // Register Business Metrics Integration
    if (mcpConfig.integrations.businessMetrics.enabled) {
      this.logger.log('📈 Registering Business Metrics sync...');
      integrationPromises.push(
        this.mcpFrameworkService.registerIntegration({
          ...mcpConfig.integrations.businessMetrics,
          serverId: 'asana_server',
        })
      );
    }

    // Register Documentation Sync Integration
    if (mcpConfig.integrations.documentationSync.enabled) {
      this.logger.log('📄 Registering Documentation sync...');
      integrationPromises.push(
        this.mcpFrameworkService.registerIntegration({
          ...mcpConfig.integrations.documentationSync,
          serverId: 'notion_server',
        })
      );
    }

    // Wait for all integrations to be registered
    await Promise.all(integrationPromises);
    this.logger.log(`✅ Registered ${integrationPromises.length} integrations`);
  }

  private async startAutomationRules(): Promise<void> {
    this.logger.log('🤖 Starting automation rules...');
    
    const mcpConfig = this.configService.get('mcp');
    
    // Start daily briefing automation
    if (mcpConfig.automationRules.dailyBriefing.enabled) {
      this.logger.log('📅 Daily briefing automation enabled');
      // TODO: Implement cron job for daily briefing
    }

    // Start goal monitoring automation
    if (mcpConfig.automationRules.goalMonitoring.enabled) {
      this.logger.log('🎯 Goal monitoring automation enabled');
      // TODO: Implement interval-based goal monitoring
    }

    // Start revenue tracking automation
    if (mcpConfig.automationRules.revenueTracking.enabled) {
      this.logger.log('💰 Revenue tracking automation enabled');
      // TODO: Implement revenue tracking automation
    }

    // Start expense analysis automation
    if (mcpConfig.automationRules.expenseAnalysis.enabled) {
      this.logger.log('💸 Expense analysis automation enabled');
      // TODO: Implement expense analysis automation
    }

    this.logger.log('✅ Automation rules initialized');
  }

  private logFrameworkStatus(): void {
    const servers = this.mcpFrameworkService.getServers();
    const integrations = this.mcpFrameworkService.getIntegrations();
    
    this.logger.log('📊 MCP Framework Status:');
    this.logger.log(`   • Servers: ${servers.length} registered`);
    this.logger.log(`   • Integrations: ${integrations.length} active`);
    this.logger.log(`   • Connected servers: ${servers.filter(s => s.status === 'connected').length}`);
    this.logger.log(`   • Auto-sync enabled: ${integrations.filter(i => i.autoSync).length}`);
    
    // Log individual server status
    servers.forEach(server => {
      const statusIcon = server.status === 'connected' ? '✅' : 
                        server.status === 'error' ? '❌' : '⏳';
      this.logger.log(`   ${statusIcon} ${server.name}: ${server.status}`);
    });
  }

  /**
   * Get MCP framework health status
   */
  async getHealthStatus(): Promise<any> {
    const servers = this.mcpFrameworkService.getServers();
    const integrations = this.mcpFrameworkService.getIntegrations();
    
    return {
      status: 'healthy',
      servers: {
        total: servers.length,
        connected: servers.filter(s => s.status === 'connected').length,
        disconnected: servers.filter(s => s.status === 'disconnected').length,
        error: servers.filter(s => s.status === 'error').length,
      },
      integrations: {
        total: integrations.length,
        enabled: integrations.filter(i => i.enabled).length,
        autoSync: integrations.filter(i => i.autoSync).length,
      },
      lastCheck: new Date().toISOString(),
    };
  }

  /**
   * Manually trigger sync for all integrations
   */
  async triggerFullSync(): Promise<any> {
    this.logger.log('🔄 Triggering full sync across all integrations...');
    
    try {
      const results = await this.mcpFrameworkService.syncAllIntegrations();
      
      this.logger.log(`✅ Full sync completed: ${results.length} integrations processed`);
      
      return {
        success: true,
        results,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('❌ Full sync failed:', error);
      throw error;
    }
  }

  /**
   * Get financial targets configuration
   */
  getFinancialTargets(): any {
    const mcpConfig = this.configService.get('mcp');
    return mcpConfig.financialTargets;
  }
}