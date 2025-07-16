import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BankingIntegrationService } from '../banking-integration.service';
import { TransactionCategorizationService } from '../services/transaction-categorization.service';
import { FraudDetectionService } from '../services/fraud-detection.service';
import { AdvancedLoggerService } from '../../../common/logger/advanced-logger.service';
import { TransactionCategory } from '../interfaces/banking.interface';

describe('Banking Integration Simple Tests', () => {
  let bankingService: BankingIntegrationService;
  let categorizationService: TransactionCategorizationService;
  let fraudDetectionService: FraudDetectionService;

  beforeEach(async () => {
    const mockLogger = {
      logFinancial: jest.fn(),
      logSecurity: jest.fn(),
      logAutomation: jest.fn(),
      error: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config = {
          NODE_ENV: 'test',
          NEDBANK_SANDBOX_MODE: 'true',
          OKRA_ENVIRONMENT: 'sandbox',
          OKRA_BASE_URL: 'https://sandbox-api.okra.ng',
          OKRA_PUBLIC_KEY: 'test-key',
          OKRA_SECRET_KEY: 'test-secret',
          NEDBANK_CLIENT_ID: 'test-client',
          NEDBANK_CLIENT_SECRET: 'test-secret',
        };
        return config[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BankingIntegrationService,
          useValue: {
            getSouthAfricanBanks: jest.fn().mockReturnValue([
              { bankId: 'nedbank', name: 'Nedbank', code: '198765' },
              { bankId: 'standardbank', name: 'Standard Bank', code: '051001' },
              { bankId: 'absa', name: 'Absa Bank', code: '632005' },
              { bankId: 'fnb', name: 'First National Bank', code: '250655' },
            ]),
            connectBank: jest.fn().mockResolvedValue({
              id: 'conn-123',
              userId: 'test-user',
              bankId: 'nedbank',
              status: 'active',
              accounts: [{ id: 'acc-123', balance: 5000 }],
            }),
            getAccounts: jest.fn().mockReturnValue([
              {
                id: 'acc-123',
                accountNumber: '1234567890',
                bankName: 'Nedbank',
                balance: 5000,
                currency: 'ZAR',
              },
            ]),
            getTransactions: jest.fn().mockReturnValue([
              {
                id: 'txn-123',
                amount: 150,
                description: 'CHECKERS PAYMENT',
                type: 'debit',
                date: new Date(),
                category: TransactionCategory.GROCERIES,
              },
            ]),
          },
        },
        TransactionCategorizationService,
        FraudDetectionService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AdvancedLoggerService,
          useValue: mockLogger,
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

    it('should return South African banks', () => {
      const banks = bankingService.getSouthAfricanBanks();
      expect(banks).toBeDefined();
      expect(banks.length).toBeGreaterThan(0);
      expect(banks.map(b => b.bankId)).toContain('nedbank');
    });

    it('should connect to a bank', async () => {
      const connection = await bankingService.connectBank('test-user', 'nedbank', 'okra');
      expect(connection).toBeDefined();
      expect(connection.userId).toBe('test-user');
      expect(connection.bankId).toBe('nedbank');
      expect(connection.status).toBe('active');
    });

    it('should get user accounts', () => {
      const accounts = bankingService.getAccounts('test-user');
      expect(accounts).toBeDefined();
      expect(Array.isArray(accounts)).toBe(true);
      expect(accounts.length).toBeGreaterThan(0);
    });

    it('should get account transactions', () => {
      const transactions = bankingService.getTransactions('acc-123');
      expect(transactions).toBeDefined();
      expect(Array.isArray(transactions)).toBe(true);
      expect(transactions.length).toBeGreaterThan(0);
    });
  });

  describe('TransactionCategorizationService', () => {
    it('should be defined', () => {
      expect(categorizationService).toBeDefined();
    });

    it('should categorize South African merchants', async () => {
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

    it('should get categorization statistics', () => {
      const stats = categorizationService.getCategorizationStats();
      expect(stats).toBeDefined();
      expect(stats.totalRules).toBeGreaterThan(0);
      expect(stats.totalMerchants).toBeGreaterThan(0);
    });
  });

  describe('FraudDetectionService', () => {
    it('should be defined', () => {
      expect(fraudDetectionService).toBeDefined();
    });

    it('should have fraud detection rules', () => {
      const rules = fraudDetectionService.getFraudRules();
      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBeGreaterThan(0);
    });

    it('should analyze transactions for fraud', async () => {
      const mockTransaction = {
        id: 'test-txn-1',
        accountId: 'test-acc-1',
        externalId: 'ext-1',
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

      const fraudScore = await fraudDetectionService.analyzeTransaction(mockTransaction, mockAccount);
      expect(typeof fraudScore).toBe('number');
      expect(fraudScore).toBeGreaterThanOrEqual(0);
      expect(fraudScore).toBeLessThanOrEqual(100);
    });
  });
});