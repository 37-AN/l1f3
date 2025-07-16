import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AdvancedLoggerService } from '../advanced-logger.service';

describe('AdvancedLoggerService', () => {
  let service: AdvancedLoggerService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdvancedLoggerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config = {
                LOG_LEVEL: 'debug',
                NODE_ENV: 'test',
              };
              return config[key] || defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AdvancedLoggerService>(AdvancedLoggerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create winston logger instance', () => {
    const logger = service.getLogger();
    expect(logger).toBeDefined();
    expect(logger.level).toBe('debug');
  });

  it('should log general messages', () => {
    const logSpy = jest.spyOn(service.getLogger(), 'info');
    
    service.log('Test message', {
      userId: 'user123',
      operation: 'test_operation',
      success: true,
    });

    expect(logSpy).toHaveBeenCalledWith('Test message', expect.objectContaining({
      userId: 'user123',
      operation: 'test_operation',
      success: true,
      service: 'lif3-backend',
    }));
  });

  it('should log financial operations', () => {
    const logSpy = jest.spyOn(service.getLogger(), 'info');
    
    service.logFinancial('Investment transaction processed', {
      userId: 'user123',
      amount: 50000,
      currency: 'ZAR',
      goalImpact: 'positive',
      goalProgress: 0.25,
      operation: 'investment_transaction',
    });

    expect(logSpy).toHaveBeenCalledWith('Investment transaction processed', expect.objectContaining({
      userId: 'user123',
      amount: 50000,
      currency: 'ZAR',
      goalImpact: 'positive',
      goalProgress: 0.25,
      category: 'financial',
      auditType: 'financial_operation',
      service: 'lif3-backend',
    }));
  });

  it('should log MCP operations', () => {
    const logSpy = jest.spyOn(service.getLogger(), 'info');
    
    service.logMCP('MCP server sync completed', {
      serverId: 'sentry_server',
      integrationId: 'error_tracking',
      operation: 'sync_operation',
      success: true,
      performanceMetrics: {
        requestTime: 150,
        responseTime: 200,
        dataSize: 1024,
      },
    });

    expect(logSpy).toHaveBeenCalledWith('MCP server sync completed', expect.objectContaining({
      serverId: 'sentry_server',
      integrationId: 'error_tracking',
      operation: 'sync_operation',
      success: true,
      category: 'mcp',
      framework: 'mcp',
      service: 'lif3-backend',
    }));
  });

  it('should log security events', () => {
    const logSpy = jest.spyOn(service.getLogger(), 'warn');
    
    service.logSecurity('Unauthorized access attempt', {
      userId: 'unknown',
      operation: 'login_attempt',
      success: false,
      metadata: {
        ip: '192.168.1.100',
        userAgent: 'Test Browser',
      },
    });

    expect(logSpy).toHaveBeenCalledWith('Unauthorized access attempt', expect.objectContaining({
      userId: 'unknown',
      operation: 'login_attempt',
      success: false,
      category: 'security',
      auditType: 'security_event',
      service: 'lif3-backend',
    }));
  });

  it('should log performance metrics', () => {
    const logSpy = jest.spyOn(service.getLogger(), 'info');
    
    service.logPerformance('API endpoint performance', {
      operation: 'get_financial_summary',
      duration: 250,
      memoryUsage: 45,
      requestSize: 512,
      responseSize: 2048,
    });

    expect(logSpy).toHaveBeenCalledWith('API endpoint performance', expect.objectContaining({
      operation: 'get_financial_summary',
      duration: 250,
      memoryUsage: 45,
      category: 'performance',
      service: 'lif3-backend',
    }));
  });

  it('should log automation events', () => {
    const logSpy = jest.spyOn(service.getLogger(), 'info');
    
    service.logAutomation('Automation rule triggered', {
      ruleId: 'daily_briefing',
      triggeredBy: 'cron_schedule',
      action: 'generate_briefing',
      success: true,
      automationResult: { briefingGenerated: true },
    });

    expect(logSpy).toHaveBeenCalledWith('Automation rule triggered', expect.objectContaining({
      ruleId: 'daily_briefing',
      triggeredBy: 'cron_schedule',
      action: 'generate_briefing',
      success: true,
      category: 'automation',
      auditType: 'automation_event',
      service: 'lif3-backend',
    }));
  });

  it('should log goal tracking events', () => {
    const logSpy = jest.spyOn(service.getLogger(), 'info');
    
    service.logGoalTracking('Net worth milestone reached', {
      goalType: 'net_worth',
      targetAmount: 1800000,
      currentAmount: 450000,
      progressPercentage: 25,
      milestoneAchieved: true,
      currency: 'ZAR',
    });

    expect(logSpy).toHaveBeenCalledWith('Net worth milestone reached', expect.objectContaining({
      goalType: 'net_worth',
      targetAmount: 1800000,
      currentAmount: 450000,
      progressPercentage: 25,
      milestoneAchieved: true,
      currency: 'ZAR',
      category: 'goal_tracking',
      auditType: 'goal_progress',
      service: 'lif3-backend',
    }));
  });

  it('should log errors with stack traces', () => {
    const logSpy = jest.spyOn(service.getLogger(), 'error');
    const error = new Error('Test error');
    
    service.error('Database connection failed', error, {
      userId: 'user123',
      operation: 'database_query',
    });

    expect(logSpy).toHaveBeenCalledWith('Database connection failed', expect.objectContaining({
      userId: 'user123',
      operation: 'database_query',
      error: {
        name: 'Error',
        message: 'Test error',
        stack: expect.any(String),
      },
      category: 'error',
      service: 'lif3-backend',
    }));
  });

  it('should log financial transactions', () => {
    const logSpy = jest.spyOn(service, 'logFinancial');
    
    service.logFinancialTransaction('income', 25000, 'ZAR', {
      userId: 'user123',
      operation: 'salary_payment',
      goalImpact: 'positive',
    });

    expect(logSpy).toHaveBeenCalledWith('Financial transaction: income', expect.objectContaining({
      userId: 'user123',
      amount: 25000,
      currency: 'ZAR',
      operation: 'financial_income',
      auditType: 'financial_transaction',
      goalImpact: 'positive',
    }));
  });

  it('should log MCP operations with structured data', () => {
    const logSpy = jest.spyOn(service, 'logMCP');
    
    service.logMCPOperation('sync', 'asana_server', {
      integrationId: 'task_management',
      success: true,
      duration: 300,
      syncResult: { tasksProcessed: 15 },
    });

    expect(logSpy).toHaveBeenCalledWith('MCP operation: sync', expect.objectContaining({
      serverId: 'asana_server',
      integrationId: 'task_management',
      operation: 'mcp_sync',
      success: true,
      duration: 300,
    }));
  });

  it('should log automation triggers', () => {
    const logSpy = jest.spyOn(service, 'logAutomation');
    
    service.logAutomationTrigger('goal_check', 'schedule', 'check_progress', true, {
      userId: 'user123',
    });

    expect(logSpy).toHaveBeenCalledWith('Automation triggered: goal_check', expect.objectContaining({
      userId: 'user123',
      ruleId: 'goal_check',
      triggeredBy: 'schedule',
      action: 'check_progress',
      success: true,
      operation: 'automation_trigger',
    }));
  });

  it('should log goal milestones', () => {
    const logSpy = jest.spyOn(service, 'logGoalTracking');
    
    service.logGoalMilestone('net_worth', 450000, 1800000, 25, {
      userId: 'user123',
      currency: 'ZAR',
    });

    expect(logSpy).toHaveBeenCalledWith('Goal milestone: net_worth', expect.objectContaining({
      userId: 'user123',
      goalType: 'net_worth',
      currentAmount: 450000,
      targetAmount: 1800000,
      progressPercentage: 25,
      milestoneAchieved: true,
      currency: 'ZAR',
      operation: 'goal_milestone',
    }));
  });

  it('should create child logger with default context', () => {
    const childLogger = service.createChildLogger({
      userId: 'user123',
      sessionId: 'session456',
    });

    const logSpy = jest.spyOn(service, 'log');
    
    childLogger.log('Child logger test', { operation: 'test' });

    expect(logSpy).toHaveBeenCalledWith('Child logger test', expect.objectContaining({
      userId: 'user123',
      sessionId: 'session456',
      operation: 'test',
    }));
  });

  it('should handle debug logging in development', () => {
    const debugSpy = jest.spyOn(service.getLogger(), 'debug');
    
    service.debug('Debug message', {
      userId: 'user123',
      operation: 'debug_operation',
    });

    // Should not log in test environment
    expect(debugSpy).not.toHaveBeenCalled();
  });

  it('should handle warnings', () => {
    const warnSpy = jest.spyOn(service.getLogger(), 'warn');
    
    service.warn('Warning message', {
      userId: 'user123',
      operation: 'warning_operation',
    });

    expect(warnSpy).toHaveBeenCalledWith('Warning message', expect.objectContaining({
      userId: 'user123',
      operation: 'warning_operation',
      category: 'warning',
      service: 'lif3-backend',
    }));
  });
});