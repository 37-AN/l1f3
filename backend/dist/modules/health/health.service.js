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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const test_connections_1 = require("../../scripts/test-connections");
const mcp_initialization_service_1 = require("../mcp-framework/mcp-initialization.service");
let HealthService = class HealthService {
    constructor(configService, mcpInitService) {
        this.configService = configService;
        this.mcpInitService = mcpInitService;
    }
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
        const tester = new test_connections_1.ConnectionTester();
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
        }
        catch (error) {
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
        }
        catch (error) {
            return {
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        mcp_initialization_service_1.MCPInitializationService])
], HealthService);
//# sourceMappingURL=health.service.js.map