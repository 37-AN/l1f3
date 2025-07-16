import { Module } from '@nestjs/common';
import { BankingIntegrationService } from './banking-integration.service';
import { BankingIntegrationController } from './banking-integration.controller';
import { NedBankService } from './providers/nedbank.service';
import { OkraService } from './providers/okra.service';
import { TransactionCategorizationService } from './services/transaction-categorization.service';
import { FraudDetectionService } from './services/fraud-detection.service';
import { BankingInsightsService } from './services/banking-insights.service';
import { PaymentService } from './services/payment.service';
import { MCPFrameworkModule } from '../mcp-framework/mcp-framework.module';
import { AIAutomationModule } from '../ai-automation/ai-automation.module';
import { AdvancedLoggerService } from '../../common/logger/advanced-logger.service';

@Module({
  imports: [
    MCPFrameworkModule,
    AIAutomationModule,
  ],
  controllers: [BankingIntegrationController],
  providers: [
    BankingIntegrationService,
    NedBankService,
    OkraService,
    TransactionCategorizationService,
    FraudDetectionService,
    BankingInsightsService,
    PaymentService,
    AdvancedLoggerService,
  ],
  exports: [
    BankingIntegrationService,
    TransactionCategorizationService,
    FraudDetectionService,
    BankingInsightsService,
    PaymentService,
  ],
})
export class BankingIntegrationModule {}