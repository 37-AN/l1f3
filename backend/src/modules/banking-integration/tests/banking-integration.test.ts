import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BankingIntegrationService } from '../banking-integration.service';
import { NedBankService } from '../providers/nedbank.service';
import { OkraService } from '../providers/okra.service';
import { TransactionCategorizationService } from '../services/transaction-categorization.service';
import { FraudDetectionService } from '../services/fraud-detection.service';
import { BankingInsightsService } from '../services/banking-insights.service';
import { PaymentService } from '../services/payment.service';
import { AdvancedLoggerService } from '../../../common/logger/advanced-logger.service';
import { MCPFrameworkService } from '../../mcp-framework/mcp-framework.service';
import { AIAutomationService } from '../../ai-automation/ai-automation.service';
import { FinancialGoalTrackerService } from '../../ai-automation/financial-goal-tracker.service';
import { TransactionCategory } from '../interfaces/banking.interface';

describe('Banking Integration Module Tests', () => {
  let bankingService: BankingIntegrationService;
  let categorizationService: TransactionCategorizationService;
  let fraudDetectionService: FraudDetectionService;
  let mockLogger: Partial<AdvancedLoggerService>;
  let mockMCPFramework: Partial<MCPFrameworkService>;
  let mockAIAutomation: Partial<AIAutomationService>;
  let mockGoalTracker: Partial<FinancialGoalTrackerService>;

  beforeEach(async () => {
    // Create mocks
    mockLogger = {
      logFinancial: jest.fn(),
      logSecurity: jest.fn(),
      logAutomation: jest.fn(),
      error: jest.fn(),
    };

    mockMCPFramework = {
      sendMessage: jest.fn().mockResolvedValue({ success: true }),
      syncAllIntegrations: jest.fn().mockResolvedValue(true),
    };

    mockAIAutomation = {
      executeAutomationWorkflow: jest.fn().mockResolvedValue({
        success: true,
        executionTime: 100,
        actions: [],
        recommendations: [],
      }),
    };

    mockGoalTracker = {
      getGoal: jest.fn().mockReturnValue({
        id: 'net_worth_1800000',
        name: 'Net Worth Goal',
        targetAmount: 1800000,
        currentAmount: 250000,
      }),
      updateGoalProgress: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankingIntegrationService,
        NedBankService,
        OkraService,
        TransactionCategorizationService,
        FraudDetectionService,
        BankingInsightsService,
        PaymentService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                NODE_ENV: 'test',
                NEDBANK_SANDBOX_MODE: 'true',
                OKRA_ENVIRONMENT: 'sandbox',
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
          provide: AIAutomationService,
          useValue: mockAIAutomation,
        },
        {
          provide: FinancialGoalTrackerService,
          useValue: mockGoalTracker,
        },
      ],
    }).compile();

    bankingService = module.get<BankingIntegrationService>(BankingIntegrationService);
    categorizationService = module.get<TransactionCategorizationService>(TransactionCategorizationService);
    fraudDetectionService = module.get<FraudDetectionService>(FraudDetectionService);
  });

  describe('BankingIntegrationService', () => {
    it('should be defined', () => {
      expect(bankingService).toBeDefined();
    });

    it('should load South African banks', () => {
      const banks = bankingService.getSouthAfricanBanks();
      expect(banks.length).toBeGreaterThan(0);
      
      // Check for major SA banks
      const bankIds = banks.map(b => b.bankId);
      expect(bankIds).toContain('nedbank');
      expect(bankIds).toContain('standardbank');
      expect(bankIds).toContain('absa');
      expect(bankIds).toContain('fnb');
      expect(bankIds).toContain('capitecbank');
    });

    it('should connect to a bank in sandbox mode', async () => {
      const connection = await bankingService.connectBank('test-user', 'nedbank', 'okra');
      
      expect(connection).toBeDefined();
      expect(connection.userId).toBe('test-user');
      expect(connection.bankId).toBe('nedbank');
      expect(connection.status).toBe('active');
      expect(connection.accounts.length).toBeGreaterThan(0);
    });

    it('should sync account data', async () => {
      // First connect a bank
      const connection = await bankingService.connectBank('test-user', 'standardbank', 'okra');
      
      // Then sync data
      const results = await bankingService.syncAccountData(connection.id);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].success).toBe(true);
    });

    it('should get banking dashboard', async () => {
      // Connect a bank first
      await bankingService.connectBank('test-user', 'fnb', 'okra');
      
      const dashboard = await bankingService.getBankingDashboard('test-user');
      
      expect(dashboard).toBeDefined();
      expect(dashboard.totalBalance).toBeGreaterThanOrEqual(0);
      expect(dashboard.monthlyIncome).toBeGreaterThanOrEqual(0);
      expect(dashboard.monthlyExpenses).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(dashboard.topExpenseCategories)).toBe(true);
      expect(Array.isArray(dashboard.recentTransactions)).toBe(true);
      expect(Array.isArray(dashboard.goalProgress)).toBe(true);
    });

    it('should disconnect bank', async () => {
      const connection = await bankingService.connectBank('test-user', 'capitecbank', 'okra');
      
      await bankingService.disconnectBank(connection.id);
      
      const updatedConnection = await bankingService.getConnectionStatus(connection.id);
      expect(updatedConnection?.status).toBe('inactive');
    });
  });

  describe('TransactionCategorizationService', () => {
    it('should be defined', () => {
      expect(categorizationService).toBeDefined();
    });

    it('should categorize South African merchants correctly', async () => {
      const mockTransaction = {
        id: 'test-txn-1',
        accountId: 'test-acc-1',
        externalId: 'ext-1',
        type: 'debit' as const,
        amount: 150.00,
        currency: 'ZAR',
        description: 'CHECKERS HYPER PAYMENT',
        reference: 'REF123',
        category: TransactionCategory.UNKNOWN,
        date: new Date(),
        valueDate: new Date(),
        balance: 5000,
        paymentMethod: 'card' as const,
        status: 'completed' as const,
        tags: [],
        isRecurring: false,
        isReviewed: false,
        metadata: {
          importedAt: new Date(),
          lastUpdated: new Date(),
          confidence: 100,
          enrichmentVersion: '1.0',
        },
      };

      const category = await categorizationService.categorizeTransaction(mockTransaction);
      expect(category).toBe(TransactionCategory.GROCERIES);
    });

    it('should categorize salary transactions', async () => {
      const salaryTransaction = {
        id: 'test-txn-2',
        accountId: 'test-acc-1',
        externalId: 'ext-2',
        type: 'credit' as const,
        amount: 35000.00,
        currency: 'ZAR',
        description: 'SALARY PAYMENT - EMPLOYER',
        reference: 'SAL001',
        category: TransactionCategory.UNKNOWN,
        date: new Date(),
        valueDate: new Date(),
        balance: 40000,
        paymentMethod: 'eft' as const,
        status: 'completed' as const,
        tags: [],
        isRecurring: true,
        isReviewed: false,
        metadata: {
          importedAt: new Date(),
          lastUpdated: new Date(),
          confidence: 100,
          enrichmentVersion: '1.0',
        },
      };

      const category = await categorizationService.categorizeTransaction(salaryTransaction);
      expect(category).toBe(TransactionCategory.SALARY);
    });

    it('should categorize 43V3R business transactions', async () => {
      const businessTransaction = {
        id: 'test-txn-3',
        accountId: 'test-acc-1',
        externalId: 'ext-3',
        type: 'credit' as const,
        amount: 2500.00,
        currency: 'ZAR',
        description: '43V3R BUSINESS PAYMENT',
        reference: '43V3R001',
        category: TransactionCategory.UNKNOWN,
        date: new Date(),
        valueDate: new Date(),
        balance: 42500,
        paymentMethod: 'eft' as const,
        status: 'completed' as const,
        tags: [],
        isRecurring: false,
        isReviewed: false,
        metadata: {
          importedAt: new Date(),
          lastUpdated: new Date(),
          confidence: 100,
          enrichmentVersion: '1.0',
        },
      };

      const category = await categorizationService.categorizeTransaction(businessTransaction);
      expect(category).toBe(TransactionCategory.BUSINESS_REVENUE);
    });

    it('should get categorization statistics', () => {
      const stats = categorizationService.getCategorizationStats();
      
      expect(stats).toBeDefined();
      expect(stats.totalRules).toBeGreaterThan(0);
      expect(stats.totalMerchants).toBeGreaterThan(0);
      expect(Array.isArray(stats.topCategories)).toBe(true);
    });
  });

  describe('FraudDetectionService', () => {
    it('should be defined', () => {
      expect(fraudDetectionService).toBeDefined();
    });

    it('should analyze normal transactions with low fraud score', async () => {
      const normalTransaction = {
        id: 'test-txn-4',
        accountId: 'test-acc-1',
        externalId: 'ext-4',
        type: 'debit' as const,
        amount: 75.00,
        currency: 'ZAR',
        description: 'WOOLWORTHS PAYMENT',
        reference: 'REF456',
        category: TransactionCategory.GROCERIES,
        date: new Date(),
        valueDate: new Date(),
        balance: 4925,
        paymentMethod: 'card' as const,
        status: 'completed' as const,
        tags: [],
        isRecurring: false,
        isReviewed: false,
        metadata: {
          importedAt: new Date(),
          lastUpdated: new Date(),
          confidence: 100,
          enrichmentVersion: '1.0',
        },
      };

      const mockAccount = {
        id: 'test-acc-1',
        accountNumber: '1234567890',
        accountType: 'current' as const,
        bankId: 'standardbank',
        bankName: 'Standard Bank',
        accountName: 'Current Account',
        currency: 'ZAR',
        balance: 4925,
        availableBalance: 4925,
        fees: {
          monthlyFee: 85,
          transactionFees: {
            eft: 8.00,
            debitOrder: 5.50,
            cashWithdrawal: 9.00,
            cardPurchase: 3.00,
            onlinePurchase: 1.50,
          },
        },
        isActive: true,
        lastSyncAt: new Date(),
        metadata: {
          productType: 'Current Account',
          accountOpenDate: new Date('2020-01-01'),
          monthlyLimit: 50000,
          dailyLimit: 10000,
        },
      };

      const fraudScore = await fraudDetectionService.analyzeTransaction(normalTransaction, mockAccount);
      expect(fraudScore).toBeLessThan(50); // Normal transaction should have low fraud score
    });

    it('should detect high fraud score for unusual amounts', async () => {
      const unusualTransaction = {
        id: 'test-txn-5',
        accountId: 'test-acc-1',
        externalId: 'ext-5',
        type: 'debit' as const,
        amount: 50000.00, // Very high amount
        currency: 'ZAR',
        description: 'UNKNOWN MERCHANT',
        reference: 'REF789',
        category: TransactionCategory.UNKNOWN,
        date: new Date(),
        valueDate: new Date(),
        balance: -45075,
        paymentMethod: 'online' as const,
        status: 'completed' as const,
        tags: [],
        isRecurring: false,
        isReviewed: false,
        metadata: {
          importedAt: new Date(),
          lastUpdated: new Date(),
          confidence: 100,
          enrichmentVersion: '1.0',
        },
      };

      const mockAccount = {
        id: 'test-acc-1',
        accountNumber: '1234567890',
        accountType: 'current' as const,
        bankId: 'standardbank',
        bankName: 'Standard Bank',
        accountName: 'Current Account',
        currency: 'ZAR',
        balance: -45075,
        availableBalance: -45075,
        fees: {
          monthlyFee: 85,
          transactionFees: {
            eft: 8.00,
            debitOrder: 5.50,
            cashWithdrawal: 9.00,
            cardPurchase: 3.00,
            onlinePurchase: 1.50,
          },
        },
        isActive: true,
        lastSyncAt: new Date(),
        metadata: {
          productType: 'Current Account',
          accountOpenDate: new Date('2020-01-01'),
          monthlyLimit: 50000,
          dailyLimit: 10000,
        },
      };

      const fraudScore = await fraudDetectionService.analyzeTransaction(unusualTransaction, mockAccount);
      expect(fraudScore).toBeGreaterThan(30); // Unusual transaction should have higher fraud score
    });

    it('should get fraud rules', () => {
      const rules = fraudDetectionService.getFraudRules();
      
      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBeGreaterThan(0);
      
      // Check for expected rule types
      const ruleTypes = rules.map(r => r.type);
      expect(ruleTypes).toContain('amount');
      expect(ruleTypes).toContain('velocity');
      expect(ruleTypes).toContain('location');
      expect(ruleTypes).toContain('merchant');
    });

    it('should get active alerts count', async () => {
      const alertCount = await fraudDetectionService.getActiveAlertsCount('test-user');
      expect(typeof alertCount).toBe('number');
      expect(alertCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('NedBank Provider', () => {
    let nedBankService: NedBankService;

    beforeEach(() => {
      nedBankService = new NedBankService(
        new ConfigService(),
        mockLogger as AdvancedLoggerService
      );
    });

    it('should initialize in sandbox mode', async () => {
      await expect(nedBankService.initialize()).resolves.not.toThrow();
    });

    it('should create sandbox connection', async () => {
      const connection = await nedBankService.connect('test-user');
      
      expect(connection).toBeDefined();
      expect(connection.userId).toBe('test-user');
      expect(connection.providerId).toBe('nedbank');
      expect(connection.status).toBe('active');
    });

    it('should get sandbox accounts', async () => {
      const connection = await nedBankService.connect('test-user');
      const accounts = await nedBankService.getAccounts(connection);
      
      expect(Array.isArray(accounts)).toBe(true);
      expect(accounts.length).toBeGreaterThan(0);
      expect(accounts[0].bankName).toBe('Nedbank');
      expect(accounts[0].currency).toBe('ZAR');
    });

    it('should get sandbox transactions', async () => {
      const connection = await nedBankService.connect('test-user');
      const transactions = await nedBankService.getTransactions(connection);
      
      expect(typeof transactions).toBe('object');
      expect(Object.keys(transactions).length).toBeGreaterThan(0);
      
      // Check first account's transactions
      const firstAccountTransactions = Object.values(transactions)[0];
      expect(Array.isArray(firstAccountTransactions)).toBe(true);
      expect(firstAccountTransactions.length).toBeGreaterThan(0);
    });
  });

  describe('Okra Provider', () => {
    let okraService: OkraService;

    beforeEach(() => {
      okraService = new OkraService(
        new ConfigService(),
        mockLogger as AdvancedLoggerService
      );
    });

    it('should initialize in sandbox mode', async () => {
      await expect(okraService.initialize()).resolves.not.toThrow();
    });

    it('should get supported banks', () => {
      const banks = okraService.getSupportedBanks();
      
      expect(Array.isArray(banks)).toBe(true);
      expect(banks.length).toBeGreaterThan(0);
      
      // Check for major SA banks
      const bankIds = banks.map(b => b.id);
      expect(bankIds).toContain('standardbank');
      expect(bankIds).toContain('absa');
      expect(bankIds).toContain('fnb');
    });

    it('should create sandbox connection', async () => {
      const connection = await okraService.connectBank('test-user', 'standardbank');
      
      expect(connection).toBeDefined();
      expect(connection.userId).toBe('test-user');
      expect(connection.providerId).toBe('okra');
      expect(connection.bankId).toBe('standardbank');
      expect(connection.status).toBe('active');
    });

    it('should get sandbox accounts', async () => {
      const connection = await okraService.connectBank('test-user', 'absa');
      const accounts = await okraService.getAccounts(connection);
      
      expect(Array.isArray(accounts)).toBe(true);
      expect(accounts.length).toBeGreaterThan(0);
      expect(accounts[0].currency).toBe('ZAR');
    });
  });
});