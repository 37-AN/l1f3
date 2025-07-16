"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const banking_integration_service_1 = require("../banking-integration.service");
const nedbank_service_1 = require("../providers/nedbank.service");
const okra_service_1 = require("../providers/okra.service");
const transaction_categorization_service_1 = require("../services/transaction-categorization.service");
const fraud_detection_service_1 = require("../services/fraud-detection.service");
const banking_insights_service_1 = require("../services/banking-insights.service");
const payment_service_1 = require("../services/payment.service");
const advanced_logger_service_1 = require("../../../common/logger/advanced-logger.service");
const mcp_framework_service_1 = require("../../mcp-framework/mcp-framework.service");
const ai_automation_service_1 = require("../../ai-automation/ai-automation.service");
const financial_goal_tracker_service_1 = require("../../ai-automation/financial-goal-tracker.service");
const banking_interface_1 = require("../interfaces/banking.interface");
describe('Banking Integration Module Tests', () => {
    let bankingService;
    let categorizationService;
    let fraudDetectionService;
    let mockLogger;
    let mockMCPFramework;
    let mockAIAutomation;
    let mockGoalTracker;
    beforeEach(async () => {
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
        const module = await testing_1.Test.createTestingModule({
            providers: [
                banking_integration_service_1.BankingIntegrationService,
                nedbank_service_1.NedBankService,
                okra_service_1.OkraService,
                transaction_categorization_service_1.TransactionCategorizationService,
                fraud_detection_service_1.FraudDetectionService,
                banking_insights_service_1.BankingInsightsService,
                payment_service_1.PaymentService,
                {
                    provide: config_1.ConfigService,
                    useValue: {
                        get: jest.fn((key) => {
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
                    provide: advanced_logger_service_1.AdvancedLoggerService,
                    useValue: mockLogger,
                },
                {
                    provide: mcp_framework_service_1.MCPFrameworkService,
                    useValue: mockMCPFramework,
                },
                {
                    provide: ai_automation_service_1.AIAutomationService,
                    useValue: mockAIAutomation,
                },
                {
                    provide: financial_goal_tracker_service_1.FinancialGoalTrackerService,
                    useValue: mockGoalTracker,
                },
            ],
        }).compile();
        bankingService = module.get(banking_integration_service_1.BankingIntegrationService);
        categorizationService = module.get(transaction_categorization_service_1.TransactionCategorizationService);
        fraudDetectionService = module.get(fraud_detection_service_1.FraudDetectionService);
    });
    describe('BankingIntegrationService', () => {
        it('should be defined', () => {
            expect(bankingService).toBeDefined();
        });
        it('should load South African banks', () => {
            const banks = bankingService.getSouthAfricanBanks();
            expect(banks.length).toBeGreaterThan(0);
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
            const connection = await bankingService.connectBank('test-user', 'standardbank', 'okra');
            const results = await bankingService.syncAccountData(connection.id);
            expect(results).toBeDefined();
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].success).toBe(true);
        });
        it('should get banking dashboard', async () => {
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
                type: 'debit',
                amount: 150.00,
                currency: 'ZAR',
                description: 'CHECKERS HYPER PAYMENT',
                reference: 'REF123',
                category: banking_interface_1.TransactionCategory.UNKNOWN,
                date: new Date(),
                valueDate: new Date(),
                balance: 5000,
                paymentMethod: 'card',
                status: 'completed',
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
            expect(category).toBe(banking_interface_1.TransactionCategory.GROCERIES);
        });
        it('should categorize salary transactions', async () => {
            const salaryTransaction = {
                id: 'test-txn-2',
                accountId: 'test-acc-1',
                externalId: 'ext-2',
                type: 'credit',
                amount: 35000.00,
                currency: 'ZAR',
                description: 'SALARY PAYMENT - EMPLOYER',
                reference: 'SAL001',
                category: banking_interface_1.TransactionCategory.UNKNOWN,
                date: new Date(),
                valueDate: new Date(),
                balance: 40000,
                paymentMethod: 'eft',
                status: 'completed',
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
            expect(category).toBe(banking_interface_1.TransactionCategory.SALARY);
        });
        it('should categorize 43V3R business transactions', async () => {
            const businessTransaction = {
                id: 'test-txn-3',
                accountId: 'test-acc-1',
                externalId: 'ext-3',
                type: 'credit',
                amount: 2500.00,
                currency: 'ZAR',
                description: '43V3R BUSINESS PAYMENT',
                reference: '43V3R001',
                category: banking_interface_1.TransactionCategory.UNKNOWN,
                date: new Date(),
                valueDate: new Date(),
                balance: 42500,
                paymentMethod: 'eft',
                status: 'completed',
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
            expect(category).toBe(banking_interface_1.TransactionCategory.BUSINESS_REVENUE);
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
                type: 'debit',
                amount: 75.00,
                currency: 'ZAR',
                description: 'WOOLWORTHS PAYMENT',
                reference: 'REF456',
                category: banking_interface_1.TransactionCategory.GROCERIES,
                date: new Date(),
                valueDate: new Date(),
                balance: 4925,
                paymentMethod: 'card',
                status: 'completed',
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
                accountType: 'current',
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
            expect(fraudScore).toBeLessThan(50);
        });
        it('should detect high fraud score for unusual amounts', async () => {
            const unusualTransaction = {
                id: 'test-txn-5',
                accountId: 'test-acc-1',
                externalId: 'ext-5',
                type: 'debit',
                amount: 50000.00,
                currency: 'ZAR',
                description: 'UNKNOWN MERCHANT',
                reference: 'REF789',
                category: banking_interface_1.TransactionCategory.UNKNOWN,
                date: new Date(),
                valueDate: new Date(),
                balance: -45075,
                paymentMethod: 'online',
                status: 'completed',
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
                accountType: 'current',
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
            expect(fraudScore).toBeGreaterThan(30);
        });
        it('should get fraud rules', () => {
            const rules = fraudDetectionService.getFraudRules();
            expect(Array.isArray(rules)).toBe(true);
            expect(rules.length).toBeGreaterThan(0);
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
        let nedBankService;
        beforeEach(() => {
            nedBankService = new nedbank_service_1.NedBankService(new config_1.ConfigService(), mockLogger);
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
            const firstAccountTransactions = Object.values(transactions)[0];
            expect(Array.isArray(firstAccountTransactions)).toBe(true);
            expect(firstAccountTransactions.length).toBeGreaterThan(0);
        });
    });
    describe('Okra Provider', () => {
        let okraService;
        beforeEach(() => {
            okraService = new okra_service_1.OkraService(new config_1.ConfigService(), mockLogger);
        });
        it('should initialize in sandbox mode', async () => {
            await expect(okraService.initialize()).resolves.not.toThrow();
        });
        it('should get supported banks', () => {
            const banks = okraService.getSupportedBanks();
            expect(Array.isArray(banks)).toBe(true);
            expect(banks.length).toBeGreaterThan(0);
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
//# sourceMappingURL=banking-integration.test.js.map