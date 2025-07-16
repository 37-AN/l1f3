"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIAutomationModule = void 0;
const common_1 = require("@nestjs/common");
const ai_automation_service_1 = require("./ai-automation.service");
const ai_rules_engine_service_1 = require("./ai-rules-engine.service");
const financial_goal_tracker_service_1 = require("./financial-goal-tracker.service");
const predictive_analytics_service_1 = require("./predictive-analytics.service");
const ai_automation_controller_1 = require("./ai-automation.controller");
const mcp_framework_module_1 = require("../mcp-framework/mcp-framework.module");
const advanced_logger_service_1 = require("../../common/logger/advanced-logger.service");
let AIAutomationModule = class AIAutomationModule {
};
exports.AIAutomationModule = AIAutomationModule;
exports.AIAutomationModule = AIAutomationModule = __decorate([
    (0, common_1.Module)({
        imports: [mcp_framework_module_1.MCPFrameworkModule],
        controllers: [ai_automation_controller_1.AIAutomationController],
        providers: [
            ai_automation_service_1.AIAutomationService,
            ai_rules_engine_service_1.AIRulesEngineService,
            financial_goal_tracker_service_1.FinancialGoalTrackerService,
            predictive_analytics_service_1.PredictiveAnalyticsService,
            advanced_logger_service_1.AdvancedLoggerService,
        ],
        exports: [
            ai_automation_service_1.AIAutomationService,
            ai_rules_engine_service_1.AIRulesEngineService,
            financial_goal_tracker_service_1.FinancialGoalTrackerService,
            predictive_analytics_service_1.PredictiveAnalyticsService,
        ],
    })
], AIAutomationModule);
//# sourceMappingURL=ai-automation.module.js.map