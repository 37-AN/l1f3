"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingIntegrationModule = void 0;
const common_1 = require("@nestjs/common");
const banking_integration_service_1 = require("./banking-integration.service");
const banking_integration_controller_1 = require("./banking-integration.controller");
const nedbank_service_1 = require("./providers/nedbank.service");
const okra_service_1 = require("./providers/okra.service");
const transaction_categorization_service_1 = require("./services/transaction-categorization.service");
const fraud_detection_service_1 = require("./services/fraud-detection.service");
const banking_insights_service_1 = require("./services/banking-insights.service");
const payment_service_1 = require("./services/payment.service");
const mcp_framework_module_1 = require("../mcp-framework/mcp-framework.module");
const ai_automation_module_1 = require("../ai-automation/ai-automation.module");
const advanced_logger_service_1 = require("../../common/logger/advanced-logger.service");
let BankingIntegrationModule = class BankingIntegrationModule {
};
exports.BankingIntegrationModule = BankingIntegrationModule;
exports.BankingIntegrationModule = BankingIntegrationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mcp_framework_module_1.MCPFrameworkModule,
            ai_automation_module_1.AIAutomationModule,
        ],
        controllers: [banking_integration_controller_1.BankingIntegrationController],
        providers: [
            banking_integration_service_1.BankingIntegrationService,
            nedbank_service_1.NedBankService,
            okra_service_1.OkraService,
            transaction_categorization_service_1.TransactionCategorizationService,
            fraud_detection_service_1.FraudDetectionService,
            banking_insights_service_1.BankingInsightsService,
            payment_service_1.PaymentService,
            advanced_logger_service_1.AdvancedLoggerService,
        ],
        exports: [
            banking_integration_service_1.BankingIntegrationService,
            transaction_categorization_service_1.TransactionCategorizationService,
            fraud_detection_service_1.FraudDetectionService,
            banking_insights_service_1.BankingInsightsService,
            payment_service_1.PaymentService,
        ],
    })
], BankingIntegrationModule);
//# sourceMappingURL=banking-integration.module.js.map