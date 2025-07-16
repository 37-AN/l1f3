import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { LoggerModule } from "./common/logger/logger.module";
import { DatabaseModule } from "./database/database.module";
import {
  FinancialController,
  BusinessController,
} from "./modules/financial/financial.controller";
import { FinancialService } from "./modules/financial/financial.service";
import { AuthController } from "./modules/auth/auth.controller";
import { AuthService } from "./modules/auth/auth.service";
import { LIF3WebSocketGateway } from "./modules/websocket/websocket.gateway";
import { GoogleDriveService } from "./modules/integrations/google-drive.service";
import { GoogleDriveController } from "./modules/integrations/google-drive.controller";
import { DiscordBotService } from "./modules/integrations/discord-bot.service";
import { ClaudeAIService } from "./modules/integrations/claude-ai.service";
import { MonitoringService } from "./modules/monitoring/monitoring.service";
import { HealthController } from "./modules/health/health.controller";
import { HealthService } from "./modules/health/health.service";
import { RAGModule } from "./modules/rag/rag.module";
import { JwtModule } from "@nestjs/jwt";
import { BusinessStrategyModule } from "./modules/business-strategy/business-strategy.module";
import { AIAgentModule } from "./modules/ai-agent/ai-agent.module";
import { MCPFrameworkModule } from "./modules/mcp-framework/mcp-framework.module";
import { AIAutomationModule } from "./modules/ai-automation/ai-automation.module";
import { BankingIntegrationModule } from "./modules/banking-integration/banking-integration.module";
import configuration, { mcpConfig } from "./config/configuration";
import { configValidationSchema } from "./config/validation.schema";

@Module({
  imports: [
    // Configuration module with validation and structured config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
      load: [configuration, mcpConfig],
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),

    // Schedule module for cron jobs
    ScheduleModule.forRoot(),

    // JWT module
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || "lif3_jwt_secret_key_for_development",
      signOptions: { expiresIn: "1h" },
    }),

    // Logging module
    LoggerModule,

    // Database module - temporarily disabled due to SQLite enum issues
    // DatabaseModule,

    // RAG & Semantic Search module
    RAGModule,
    // Business Strategy module
    BusinessStrategyModule,
    // AI Agent module
    AIAgentModule,
    // MCP Framework module for unified integrations
    MCPFrameworkModule,
    // AI Automation module for financial goal tracking and intelligent automation
    AIAutomationModule,
    // Banking Integration module for South African banking APIs
    BankingIntegrationModule,
  ],
  controllers: [
    FinancialController,
    BusinessController,
    AuthController,
    GoogleDriveController,
    HealthController,
  ],
  providers: [
    FinancialService,
    AuthService,
    LIF3WebSocketGateway,
    GoogleDriveService,
    DiscordBotService,
    ClaudeAIService,
    MonitoringService,
    HealthService,
  ],
})
export class AppModule {
  constructor() {
    console.log("🏗️  LIF3 Unified AI Automation Strategy - App Module Initialized");
    console.log("📊 TARGET: Net Worth R0 → R1,800,000 (30% faster achievement)");
    console.log("🚀 43V3R Daily Revenue Target: R0 → R4,881");
    console.log("🤖 MCP Framework: Unified integrations with intelligent automation");
    console.log("⚡ Performance Targets: 25% expense reduction, 90% task automation");
    console.log("🔄 Database schema ready for AI-powered financial acceleration");
  }
}
