import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AIAutomationService } from '../ai-automation.service';
import { AIRulesEngineService } from '../ai-rules-engine.service';
import { FinancialGoalTrackerService } from '../financial-goal-tracker.service';
import { PredictiveAnalyticsService } from '../predictive-analytics.service';
import { AdvancedLoggerService } from '../../../common/logger/advanced-logger.service';
import { MCPFrameworkService } from '../../mcp-framework/mcp-framework.service';

// Lightweight test suite to avoid memory issues
describe('AI Automation Basic Tests', () => {
  let configService: ConfigService;
  let mockLogger: Partial<AdvancedLoggerService>;
  let mockMCPFramework: Partial<MCPFrameworkService>;

  beforeAll(() => {
    // Simple mocks to avoid memory leaks
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
    let service: AIRulesEngineService;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AIRulesEngineService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => 'test'),
            },
          },
          {
            provide: AdvancedLoggerService,
            useValue: mockLogger,
          },
          {
            provide: MCPFrameworkService,
            useValue: mockMCPFramework,
          },
        ],
      }).compile();

      service = module.get<AIRulesEngineService>(AIRulesEngineService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with default rules', () => {
      const rules = service.getRules();
      expect(rules.length).toBeGreaterThan(0);
      
      // Check for expected default rules
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
    let service: FinancialGoalTrackerService;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          FinancialGoalTrackerService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => 'test'),
            },
          },
          {
            provide: AdvancedLoggerService,
            useValue: mockLogger,
          },
          {
            provide: MCPFrameworkService,
            useValue: mockMCPFramework,
          },
        ],
      }).compile();

      service = module.get<FinancialGoalTrackerService>(FinancialGoalTrackerService);
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with default goals', () => {
      const goals = service.getGoals();
      expect(goals.length).toBeGreaterThan(0);
      
      // Check for expected default goals
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
    let service: PredictiveAnalyticsService;

    beforeAll(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          PredictiveAnalyticsService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn(() => 'test'),
            },
          },
          {
            provide: AdvancedLoggerService,
            useValue: mockLogger,
          },
          {
            provide: MCPFrameworkService,
            useValue: mockMCPFramework,
          },
        ],
      }).compile();

      service = module.get<PredictiveAnalyticsService>(PredictiveAnalyticsService);
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