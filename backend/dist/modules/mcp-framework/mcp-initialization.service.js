"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MCPInitializationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPInitializationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mcp_framework_service_1 = require("./mcp-framework.service");
const sentry_mcp_server_1 = require("../mcp-servers/sentry-mcp-server");
const notion_mcp_server_1 = require("../mcp-servers/notion-mcp-server");
const asana_mcp_server_1 = require("../mcp-servers/asana-mcp-server");
let MCPInitializationService = MCPInitializationService_1 = class MCPInitializationService {
    constructor(configService, mcpFrameworkService) {
        this.configService = configService;
        this.mcpFrameworkService = mcpFrameworkService;
        this.logger = new common_1.Logger(MCPInitializationService_1.name);
    }
    async onModuleInit() {
        this.logger.log('🚀 Initializing LIF3 MCP Framework...');
        try {
            await this.initializeMCPServers();
            await this.registerIntegrations();
            await this.startAutomationRules();
            this.logger.log('✅ MCP Framework initialized successfully');
            this.logFrameworkStatus();
        }
        catch (error) {
            this.logger.error('❌ Failed to initialize MCP Framework:', error);
            throw error;
        }
    }
    async initializeMCPServers() {
        this.logger.log('🔧 Registering MCP servers...');
        const mcpConfig = this.configService.get('mcp');
        const serverPromises = [];
        if (mcpConfig.servers.sentry.enabled) {
            this.logger.log('📊 Initializing Sentry MCP Server...');
            const sentryServer = new sentry_mcp_server_1.SentryMCPServer();
            serverPromises.push(this.mcpFrameworkService.registerServer(sentryServer.getServerConfig()));
        }
        if (mcpConfig.servers.notion.enabled) {
            this.logger.log('📚 Initializing Notion MCP Server...');
            const notionServer = new notion_mcp_server_1.NotionMCPServer();
            serverPromises.push(this.mcpFrameworkService.registerServer(notionServer.getServerConfig()));
        }
        if (mcpConfig.servers.asana.enabled) {
            this.logger.log('📋 Initializing Asana MCP Server...');
            const asanaServer = new asana_mcp_server_1.AsanaMCPServer();
            serverPromises.push(this.mcpFrameworkService.registerServer(asanaServer.getServerConfig()));
        }
        await Promise.all(serverPromises);
        this.logger.log(`✅ Registered ${serverPromises.length} MCP servers`);
    }
    async registerIntegrations() {
        this.logger.log('🔗 Registering MCP integrations...');
        const mcpConfig = this.configService.get('mcp');
        const integrationPromises = [];
        if (mcpConfig.integrations.errorToTask.enabled) {
            this.logger.log('⚠️  Registering Error-to-Task automation...');
            integrationPromises.push(this.mcpFrameworkService.registerIntegration({
                ...mcpConfig.integrations.errorToTask,
                serverId: 'sentry_server',
            }));
        }
        if (mcpConfig.integrations.goalTracking.enabled) {
            this.logger.log('🎯 Registering Goal Tracking integration...');
            integrationPromises.push(this.mcpFrameworkService.registerIntegration({
                ...mcpConfig.integrations.goalTracking,
                serverId: 'notion_server',
            }));
        }
        if (mcpConfig.integrations.businessMetrics.enabled) {
            this.logger.log('📈 Registering Business Metrics sync...');
            integrationPromises.push(this.mcpFrameworkService.registerIntegration({
                ...mcpConfig.integrations.businessMetrics,
                serverId: 'asana_server',
            }));
        }
        if (mcpConfig.integrations.documentationSync.enabled) {
            this.logger.log('📄 Registering Documentation sync...');
            integrationPromises.push(this.mcpFrameworkService.registerIntegration({
                ...mcpConfig.integrations.documentationSync,
                serverId: 'notion_server',
            }));
        }
        await Promise.all(integrationPromises);
        this.logger.log(`✅ Registered ${integrationPromises.length} integrations`);
    }
    async startAutomationRules() {
        this.logger.log('🤖 Starting automation rules...');
        const mcpConfig = this.configService.get('mcp');
        if (mcpConfig.automationRules.dailyBriefing.enabled) {
            this.logger.log('📅 Daily briefing automation enabled');
        }
        if (mcpConfig.automationRules.goalMonitoring.enabled) {
            this.logger.log('🎯 Goal monitoring automation enabled');
        }
        if (mcpConfig.automationRules.revenueTracking.enabled) {
            this.logger.log('💰 Revenue tracking automation enabled');
        }
        if (mcpConfig.automationRules.expenseAnalysis.enabled) {
            this.logger.log('💸 Expense analysis automation enabled');
        }
        this.logger.log('✅ Automation rules initialized');
    }
    logFrameworkStatus() {
        const servers = this.mcpFrameworkService.getServers();
        const integrations = this.mcpFrameworkService.getIntegrations();
        this.logger.log('📊 MCP Framework Status:');
        this.logger.log(`   • Servers: ${servers.length} registered`);
        this.logger.log(`   • Integrations: ${integrations.length} active`);
        this.logger.log(`   • Connected servers: ${servers.filter(s => s.status === 'connected').length}`);
        this.logger.log(`   • Auto-sync enabled: ${integrations.filter(i => i.autoSync).length}`);
        servers.forEach(server => {
            const statusIcon = server.status === 'connected' ? '✅' :
                server.status === 'error' ? '❌' : '⏳';
            this.logger.log(`   ${statusIcon} ${server.name}: ${server.status}`);
        });
    }
    async getHealthStatus() {
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
    async triggerFullSync() {
        this.logger.log('🔄 Triggering full sync across all integrations...');
        try {
            const results = await this.mcpFrameworkService.syncAllIntegrations();
            this.logger.log(`✅ Full sync completed: ${results.length} integrations processed`);
            return {
                success: true,
                results,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            this.logger.error('❌ Full sync failed:', error);
            throw error;
        }
    }
    getFinancialTargets() {
        const mcpConfig = this.configService.get('mcp');
        return mcpConfig.financialTargets;
    }
};
exports.MCPInitializationService = MCPInitializationService;
exports.MCPInitializationService = MCPInitializationService = MCPInitializationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        mcp_framework_service_1.MCPFrameworkService])
], MCPInitializationService);
//# sourceMappingURL=mcp-initialization.service.js.map