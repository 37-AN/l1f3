import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AIAutomationService } from '../ai-automation.service';
import { AIRulesEngineService } from '../ai-rules-engine.service';
import { FinancialGoalTrackerService } from '../financial-goal-tracker.service';
import { PredictiveAnalyticsService } from '../predictive-analytics.service';
import { AdvancedLoggerService } from '../../../common/logger/advanced-logger.service';
import { MCPFrameworkService } from '../../mcp-framework/mcp-framework.service';

describe('AIAutomationService', () => {
  let service: AIAutomationService;
  let configService: ConfigService;
  let mockLogger: Partial<AdvancedLoggerService>;
  let mockMCPFramework: Partial<MCPFrameworkService>;
  let mockRulesEngine: Partial<AIRulesEngineService>;
  let mockGoalTracker: Partial<FinancialGoalTrackerService>;
  let mockPredictiveAnalytics: Partial<PredictiveAnalyticsService>;

  beforeEach(async () => {
    // Create mocks
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

    mockRulesEngine = {
      getRules: jest.fn().mockReturnValue([]),
      executeRule: jest.fn().mockResolvedValue({ success: true, executionTime: 100, actions: [], recommendations: [] }),
    };

    mockGoalTracker = {
      getGoals: jest.fn().mockReturnValue([]),
      getGoal: jest.fn().mockReturnValue(null),
      updateGoalProgress: jest.fn().mockResolvedValue(undefined),
      getGoalAnalytics: jest.fn().mockReturnValue({
        velocity: 100,
        timeToCompletion: 365,
        trendDirection: 'up',
        confidence: 85,
        recommendations: [],
      }),
      getGoalProgress: jest.fn().mockReturnValue([]),
    };

    mockPredictiveAnalytics = {
      generateGoalPrediction: jest.fn().mockResolvedValue({
        goalId: 'test',
        predictedAmount: 1000000,
        predictedDate: new Date(),
        confidence: 85,
        scenarios: {
          optimistic: { amount: 1200000, date: new Date(), probability: 25 },
          realistic: { amount: 1000000, date: new Date(), probability: 50 },
          pessimistic: { amount: 800000, date: new Date(), probability: 25 },
        },
        recommendations: [],
        riskFactors: [],
      }),
      getModels: jest.fn().mockReturnValue([]),
      getPrediction: jest.fn().mockReturnValue(null),
      analyzeExpensePatterns: jest.fn().mockResolvedValue({
        totalExpenses: 50000,
        categories: [],
        trends: [],
        anomalies: [],
        optimizations: [],
        savingsPotential: 5000,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIAutomationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                NODE_ENV: 'test',
                LOG_LEVEL: 'info',
              };
              return config[key];
            }),
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
        {
          provide: AIRulesEngineService,
          useValue: mockRulesEngine,
        },
        {
          provide: FinancialGoalTrackerService,
          useValue: mockGoalTracker,
        },
        {
          provide: PredictiveAnalyticsService,
          useValue: mockPredictiveAnalytics,
        },
      ],
    }).compile();

    service = module.get<AIAutomationService>(AIAutomationService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize automation metrics', () => {
    const metrics = service.getAutomationMetrics();
    expect(metrics).toBeDefined();
    expect(metrics.rulesExecuted).toBe(0);
    expect(metrics.successfulAutomations).toBe(0);
    expect(metrics.failedAutomations).toBe(0);
  });

  it('should get automation dashboard', async () => {
    const dashboard = await service.getAutomationDashboard();
    
    expect(dashboard).toBeDefined();
    expect(dashboard.activeRules).toBe(0);
    expect(dashboard.executedToday).toBe(0);
    expect(dashboard.successRate).toBe(100);
    expect(dashboard.goalProgress).toBeDefined();
    expect(dashboard.predictions).toBeDefined();
    expect(dashboard.recommendations).toBeDefined();
    expect(dashboard.alerts).toBeDefined();
  });

  it('should execute financial sync workflow', async () => {
    const context = {
      userId: 'test-user',
      triggeredBy: 'manual' as const,
      timestamp: new Date(),
      data: {},
    };

    const result = await service.executeAutomationWorkflow('financial_sync', context);
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.actions).toBeDefined();
    expect(mockMCPFramework.syncAllIntegrations).toHaveBeenCalled();
  });

  it('should execute goal tracking workflow', async () => {
    const context = {
      userId: 'test-user',
      triggeredBy: 'manual' as const,
      timestamp: new Date(),
      data: {},
    };

    const result = await service.executeAutomationWorkflow('goal_tracking', context);
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.actions).toBeDefined();
    expect(result.recommendations).toBeDefined();
  });

  it('should get system status', async () => {
    const status = await service.getSystemStatus();
    
    expect(status).toBeDefined();
    expect(status.status).toBeDefined();
    expect(status.components).toBeDefined();
    expect(status.metrics).toBeDefined();
    expect(status.uptime).toBeDefined();
  });

  it('should trigger manual automation', async () => {
    const result = await service.triggerManualAutomation('financial_sync', 'test-user');
    
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should handle workflow execution errors gracefully', async () => {
    // Mock an error in the MCP framework
    mockMCPFramework.syncAllIntegrations = jest.fn().mockRejectedValue(new Error('MCP sync failed'));

    const context = {
      userId: 'test-user',
      triggeredBy: 'manual' as const,
      timestamp: new Date(),
      data: {},
    };

    await expect(service.executeAutomationWorkflow('financial_sync', context)).rejects.toThrow('MCP sync failed');
  });
});

describe('AIRulesEngineService', () => {
  let service: AIRulesEngineService;
  let mockLogger: Partial<AdvancedLoggerService>;
  let mockMCPFramework: Partial<MCPFrameworkService>;

  beforeEach(async () => {
    mockLogger = {
      logAutomation: jest.fn(),
      error: jest.fn(),
    };

    mockMCPFramework = {
      sendMessage: jest.fn().mockResolvedValue({ success: true }),
      syncIntegration: jest.fn().mockResolvedValue(true),
    };

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

  it('should register new rules', () => {
    const newRule = {
      id: 'test_rule',
      name: 'Test Rule',
      description: 'A test rule',
      type: 'financial' as const,
      priority: 'medium' as const,
      enabled: true,
      conditions: [],
      actions: [],
      metadata: {
        createdAt: new Date(),
        executionCount: 0,
        successRate: 100,
        averageExecutionTime: 0,
      },
    };

    service.registerRule(newRule);
    
    const retrievedRule = service.getRule('test_rule');
    expect(retrievedRule).toBeDefined();
    expect(retrievedRule?.name).toBe('Test Rule');
  });
});

describe('FinancialGoalTrackerService', () => {
  let service: FinancialGoalTrackerService;
  let mockLogger: Partial<AdvancedLoggerService>;
  let mockMCPFramework: Partial<MCPFrameworkService>;

  beforeEach(async () => {
    mockLogger = {
      logGoalTracking: jest.fn(),
      logGoalMilestone: jest.fn(),
      logAutomationTrigger: jest.fn(),
      error: jest.fn(),
    };

    mockMCPFramework = {
      sendMessage: jest.fn().mockResolvedValue({ success: true }),
    };

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

  it('should update goal progress', async () => {
    const goals = service.getGoals();
    const testGoal = goals[0];
    
    await service.updateGoalProgress(testGoal.id, 100000, 'manual', ['test_update']);
    
    const updatedGoal = service.getGoal(testGoal.id);
    expect(updatedGoal?.currentAmount).toBe(100000);
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

  it('should create new goals', () => {
    const newGoal = {
      id: 'test_goal',
      name: 'Test Goal',
      type: 'savings' as const,
      targetAmount: 50000,
      currentAmount: 0,
      currency: 'ZAR',
      targetDate: new Date('2025-12-31'),
      strategy: 'linear' as const,
      milestones: [],
      automationRules: [],
      metadata: {
        createdAt: new Date(),
        lastUpdated: new Date(),
        progressHistory: [],
        predictionAccuracy: 85,
      },
    };

    service.createGoal(newGoal);
    
    const retrievedGoal = service.getGoal('test_goal');
    expect(retrievedGoal).toBeDefined();
    expect(retrievedGoal?.name).toBe('Test Goal');
  });
});

describe('PredictiveAnalyticsService', () => {
  let service: PredictiveAnalyticsService;
  let mockLogger: Partial<AdvancedLoggerService>;
  let mockMCPFramework: Partial<MCPFrameworkService>;

  beforeEach(async () => {
    mockLogger = {
      logAutomation: jest.fn(),
      error: jest.fn(),
    };

    mockMCPFramework = {
      sendMessage: jest.fn().mockResolvedValue({ success: true }),
    };

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

  it('should generate goal predictions', async () => {
    const mockGoal = {
      id: 'test_goal',
      name: 'Test Goal',
      type: 'net_worth' as const,
      targetAmount: 1800000,
      currentAmount: 500000,
      currency: 'ZAR',
      targetDate: new Date('2025-12-31'),
      strategy: 'ai_optimized' as const,
      milestones: [],
      automationRules: [],
      metadata: {
        createdAt: new Date(),
        lastUpdated: new Date(),
        progressHistory: [],
        predictionAccuracy: 85,
      },
    };

    const mockHistoricalData = [
      {
        date: new Date('2025-01-01'),
        amount: 400000,
        source: 'automated' as const,
        confidence: 95,
        factors: ['salary', 'investments'],
      },
      {
        date: new Date('2025-06-01'),
        amount: 500000,
        source: 'automated' as const,
        confidence: 95,
        factors: ['salary', 'investments'],
      },
    ];

    const prediction = await service.generateGoalPrediction(mockGoal, mockHistoricalData);
    
    expect(prediction).toBeDefined();
    expect(prediction.goalId).toBe('test_goal');
    expect(prediction.predictedAmount).toBeDefined();
    expect(prediction.predictedDate).toBeDefined();
    expect(prediction.confidence).toBeDefined();
    expect(prediction.scenarios).toBeDefined();
    expect(prediction.recommendations).toBeDefined();
    expect(prediction.riskFactors).toBeDefined();
  });

  it('should analyze expense patterns', async () => {
    const mockExpenses = [
      { id: 1, amount: 1000, category: 'Food', date: new Date(), description: 'Groceries' },
      { id: 2, amount: 500, category: 'Transport', date: new Date(), description: 'Uber' },
      { id: 3, amount: 2000, category: 'Entertainment', date: new Date(), description: 'Concert' },
    ];

    const analysis = await service.analyzeExpensePatterns(mockExpenses);
    
    expect(analysis).toBeDefined();
    expect(analysis.totalExpenses).toBe(3500);
    expect(analysis.categories).toBeDefined();
    expect(analysis.trends).toBeDefined();
    expect(analysis.anomalies).toBeDefined();
    expect(analysis.optimizations).toBeDefined();
    expect(analysis.savingsPotential).toBeDefined();
  });

  it('should get market data', () => {
    const marketData = service.getMarketData();
    
    expect(marketData).toBeDefined();
    expect(Array.isArray(marketData)).toBe(true);
  });
});