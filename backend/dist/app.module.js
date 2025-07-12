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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const logger_module_1 = require("./common/logger/logger.module");
const financial_controller_1 = require("./modules/financial/financial.controller");
const financial_service_1 = require("./modules/financial/financial.service");
const auth_controller_1 = require("./modules/auth/auth.controller");
const auth_service_1 = require("./modules/auth/auth.service");
const websocket_gateway_1 = require("./modules/websocket/websocket.gateway");
const google_drive_service_1 = require("./modules/integrations/google-drive.service");
const google_drive_controller_1 = require("./modules/integrations/google-drive.controller");
const discord_bot_service_1 = require("./modules/integrations/discord-bot.service");
const claude_ai_service_1 = require("./modules/integrations/claude-ai.service");
const monitoring_service_1 = require("./modules/monitoring/monitoring.service");
const health_controller_1 = require("./modules/health/health.controller");
const health_service_1 = require("./modules/health/health.service");
const rag_module_1 = require("./modules/rag/rag.module");
const jwt_1 = require("@nestjs/jwt");
const business_strategy_module_1 = require("./modules/business-strategy/business-strategy.module");
let AppModule = class AppModule {
    constructor() {
        console.log('🏗️  LIF3 Financial Dashboard - App Module Initialized');
        console.log('📊 FRESH START: Net Worth R0 → R1,800,000 (18-month target)');
        console.log('🚀 43V3R Daily Revenue Target: R0 → R4,881');
        console.log('🔄 Database schema ready for fresh start automation');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            schedule_1.ScheduleModule.forRoot(),
            jwt_1.JwtModule.register({
                global: true,
                secret: process.env.JWT_SECRET || 'lif3_jwt_secret_key_for_development',
                signOptions: { expiresIn: '1h' },
            }),
            logger_module_1.LoggerModule,
            rag_module_1.RAGModule,
            business_strategy_module_1.BusinessStrategyModule,
        ],
        controllers: [
            financial_controller_1.FinancialController,
            financial_controller_1.BusinessController,
            auth_controller_1.AuthController,
            google_drive_controller_1.GoogleDriveController,
            health_controller_1.HealthController,
        ],
        providers: [
            financial_service_1.FinancialService,
            auth_service_1.AuthService,
            websocket_gateway_1.LIF3WebSocketGateway,
            google_drive_service_1.GoogleDriveService,
            discord_bot_service_1.DiscordBotService,
            claude_ai_service_1.ClaudeAIService,
            monitoring_service_1.MonitoringService,
            health_service_1.HealthService,
        ],
    }),
    __metadata("design:paramtypes", [])
], AppModule);
//# sourceMappingURL=app.module.js.map