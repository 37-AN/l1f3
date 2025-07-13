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
let HealthService = class HealthService {
    constructor(configService) {
        this.configService = configService;
    }
    async checkHealth() {
        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            environment: this.configService.get('NODE_ENV', 'development'),
            timezone: this.configService.get('TZ', 'Africa/Johannesburg'),
            freshStart: {
                netWorth: 'R0 → R1,800,000',
                business: '43V3R R0 → R4,881 daily',
                journey: 'Fresh Start Automation Active'
            }
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
                email: !!this.configService.get('SMTP_USER')
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
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HealthService);
//# sourceMappingURL=health.service.js.map