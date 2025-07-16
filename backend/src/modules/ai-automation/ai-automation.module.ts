import { Module } from '@nestjs/common';
import { AIAutomationService } from './ai-automation.service';
import { AIRulesEngineService } from './ai-rules-engine.service';
import { FinancialGoalTrackerService } from './financial-goal-tracker.service';
import { PredictiveAnalyticsService } from './predictive-analytics.service';
import { AIAutomationController } from './ai-automation.controller';
import { MCPFrameworkModule } from '../mcp-framework/mcp-framework.module';
import { AdvancedLoggerService } from '../../common/logger/advanced-logger.service';

@Module({
  imports: [MCPFrameworkModule],
  controllers: [AIAutomationController],
  providers: [
    AIAutomationService,
    AIRulesEngineService,
    FinancialGoalTrackerService,
    PredictiveAnalyticsService,
    AdvancedLoggerService,
  ],
  exports: [
    AIAutomationService,
    AIRulesEngineService,
    FinancialGoalTrackerService,
    PredictiveAnalyticsService,
  ],
})
export class AIAutomationModule {}