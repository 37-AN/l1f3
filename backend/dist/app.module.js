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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const ai_agent_module_1 = require("./modules/ai-agent/ai-agent.module");
const mcp_framework_module_1 = require("./modules/mcp-framework/mcp-framework.module");
const ai_automation_module_1 = require("./modules/ai-automation/ai-automation.module");
const banking_integration_module_1 = require("./modules/banking-integration/banking-integration.module");
const configuration_1 = __importStar(require("./config/configuration"));
const validation_schema_1 = require("./config/validation.schema");
let AppModule = class AppModule {
    constructor() {
        console.log("🏗️  LIF3 Unified AI Automation Strategy - App Module Initialized");
        console.log("📊 TARGET: Net Worth R0 → R1,800,000 (30% faster achievement)");
        console.log("🚀 43V3R Daily Revenue Target: R0 → R4,881");
        console.log("🤖 MCP Framework: Unified integrations with intelligent automation");
        console.log("⚡ Performance Targets: 25% expense reduction, 90% task automation");
        console.log("🔄 Database schema ready for AI-powered financial acceleration");
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: [".env.local", ".env"],
                load: [configuration_1.default, configuration_1.mcpConfig],
                validationSchema: validation_schema_1.configValidationSchema,
                validationOptions: {
                    allowUnknown: true,
                    abortEarly: true,
                },
            }),
            schedule_1.ScheduleModule.forRoot(),
            jwt_1.JwtModule.register({
                global: true,
                secret: process.env.JWT_SECRET || "lif3_jwt_secret_key_for_development",
                signOptions: { expiresIn: "1h" },
            }),
            logger_module_1.LoggerModule,
            rag_module_1.RAGModule,
            business_strategy_module_1.BusinessStrategyModule,
            ai_agent_module_1.AIAgentModule,
            mcp_framework_module_1.MCPFrameworkModule,
            ai_automation_module_1.AIAutomationModule,
            banking_integration_module_1.BankingIntegrationModule,
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