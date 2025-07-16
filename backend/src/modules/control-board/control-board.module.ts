import { Module } from '@nestjs/common';
import { ControlBoardController } from './control-board.controller';
import { ControlBoardService } from './control-board.service';
import { SystemMetricsService } from './services/system-metrics.service';
import { DashboardService } from './services/dashboard.service';
import { AlertsService } from './services/alerts.service';
import { SecurityMonitoringService } from './services/security-monitoring.service';
import { ControlBoardGateway } from './control-board.gateway';
import { LoggerModule } from '../../common/logger/logger.module';
import { MCPFrameworkModule } from '../mcp-framework/mcp-framework.module';
import { AIAutomationModule } from '../ai-automation/ai-automation.module';
import { BankingIntegrationModule } from '../banking-integration/banking-integration.module';

@Module({
  imports: [
    LoggerModule,
    MCPFrameworkModule,
    AIAutomationModule,
    BankingIntegrationModule,
  ],
  controllers: [ControlBoardController],
  providers: [
    ControlBoardService,
    SystemMetricsService,
    DashboardService,
    AlertsService,
    SecurityMonitoringService,
    ControlBoardGateway,
  ],
  exports: [
    ControlBoardService,
    SystemMetricsService,
    DashboardService,
  ],
})
export class ControlBoardModule {}