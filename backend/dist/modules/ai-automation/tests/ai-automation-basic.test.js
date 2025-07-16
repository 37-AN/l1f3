"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const ai_rules_engine_service_1 = require("../ai-rules-engine.service");
const financial_goal_tracker_service_1 = require("../financial-goal-tracker.service");
const predictive_analytics_service_1 = require("../predictive-analytics.service");
const advanced_logger_service_1 = require("../../../common/logger/advanced-logger.service");
const mcp_framework_service_1 = require("../../mcp-framework/mcp-framework.service");
describe('AI Automation Basic Tests', () => {
    let configService;
    let mockLogger;
    let mockMCPFramework;
    beforeAll(() => {
        mockLogger = {
            logAutomation: jest.fn(),
            logGoalTracking: jest.fn(),
            logPerformance: jest.fn(),
            error: jest.fn(),
        };
        mockMCPFramework = {
            sendMessage: jest.fn().mockResolvedValue({ success: true }),
            syncAllIntegrations: jest.fn().mockResolvedValue(true),
        };
    });
    describe('AIRulesEngineService Basic', () => {
        let service;
        beforeAll(async () => {
            const module = await testing_1.Test.createTestingModule({
                providers: [
                    ai_rules_engine_service_1.AIRulesEngineService,
                    {
                        provide: config_1.ConfigService,
                        useValue: {
                            get: jest.fn(() => 'test'),
                        },
                    },
                    {
                        provide: advanced_logger_service_1.AdvancedLoggerService,
                        useValue: mockLogger,
                    },
                    {
                        provide: mcp_framework_service_1.MCPFrameworkService,
                        useValue: mockMCPFramework,
                    },
                ],
            }).compile();
            service = module.get(ai_rules_engine_service_1.AIRulesEngineService);
        });
        it('should be defined', () => {
            expect(service).toBeDefined();
        });
        it('should initialize with default rules', () => {
            const rules = service.getRules();
            expect(rules.length).toBeGreaterThan(0);
            const ruleNames = rules.map(r => r.id);
            expect(ruleNames).toContain('net_worth_tracking');
            expect(ruleNames).toContain('daily_revenue_tracking');
            expect(ruleNames).toContain('expense_optimization');
            expect(ruleNames).toContain('anomaly_detection');
        });
        it('should enable and disable rules', () => {
            const rules = service.getRules();
            const testRule = rules[0];
            expect(testRule.enabled).toBe(true);
            service.disableRule(testRule.id);
            expect(service.getRule(testRule.id)?.enabled).toBe(false);
            service.enableRule(testRule.id);
            expect(service.getRule(testRule.id)?.enabled).toBe(true);
        });
    });
    describe('FinancialGoalTrackerService Basic', () => {
        let service;
        beforeAll(async () => {
            const module = await testing_1.Test.createTestingModule({
                providers: [
                    financial_goal_tracker_service_1.FinancialGoalTrackerService,
                    {
                        provide: config_1.ConfigService,
                        useValue: {
                            get: jest.fn(() => 'test'),
                        },
                    },
                    {
                        provide: advanced_logger_service_1.AdvancedLoggerService,
                        useValue: mockLogger,
                    },
                    {
                        provide: mcp_framework_service_1.MCPFrameworkService,
                        useValue: mockMCPFramework,
                    },
                ],
            }).compile();
            service = module.get(financial_goal_tracker_service_1.FinancialGoalTrackerService);
        });
        it('should be defined', () => {
            expect(service).toBeDefined();
        });
        it('should initialize with default goals', () => {
            const goals = service.getGoals();
            expect(goals.length).toBeGreaterThan(0);
            const goalIds = goals.map(g => g.id);
            expect(goalIds).toContain('net_worth_1800000');
            expect(goalIds).toContain('daily_revenue_4881');
            expect(goalIds).toContain('mrr_147917');
        });
        it('should calculate goal analytics', () => {
            const goals = service.getGoals();
            const testGoal = goals[0];
            const analytics = service.getGoalAnalytics(testGoal.id);
            expect(analytics).toBeDefined();
            expect(analytics.velocity).toBeDefined();
            expect(analytics.timeToCompletion).toBeDefined();
            expect(analytics.trendDirection).toBeDefined();
            expect(analytics.confidence).toBeDefined();
            expect(analytics.recommendations).toBeDefined();
        });
    });
    describe('PredictiveAnalyticsService Basic', () => {
        let service;
        beforeAll(async () => {
            const module = await testing_1.Test.createTestingModule({
                providers: [
                    predictive_analytics_service_1.PredictiveAnalyticsService,
                    {
                        provide: config_1.ConfigService,
                        useValue: {
                            get: jest.fn(() => 'test'),
                        },
                    },
                    {
                        provide: advanced_logger_service_1.AdvancedLoggerService,
                        useValue: mockLogger,
                    },
                    {
                        provide: mcp_framework_service_1.MCPFrameworkService,
                        useValue: mockMCPFramework,
                    },
                ],
            }).compile();
            service = module.get(predictive_analytics_service_1.PredictiveAnalyticsService);
        });
        it('should be defined', () => {
            expect(service).toBeDefined();
        });
        it('should initialize with prediction models', () => {
            const models = service.getModels();
            expect(models.length).toBeGreaterThan(0);
            const modelIds = models.map(m => m.id);
            expect(modelIds).toContain('net_worth_predictor');
            expect(modelIds).toContain('revenue_predictor');
            expect(modelIds).toContain('expense_predictor');
            expect(modelIds).toContain('market_predictor');
        });
        it('should get market data', () => {
            const marketData = service.getMarketData();
            expect(marketData).toBeDefined();
            expect(Array.isArray(marketData)).toBe(true);
        });
    });
});
//# sourceMappingURL=ai-automation-basic.test.js.map