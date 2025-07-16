"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BankingIntegrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingIntegrationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const advanced_logger_service_1 = require("../../common/logger/advanced-logger.service");
const mcp_framework_service_1 = require("../mcp-framework/mcp-framework.service");
const ai_automation_service_1 = require("../ai-automation/ai-automation.service");
const financial_goal_tracker_service_1 = require("../ai-automation/financial-goal-tracker.service");
const nedbank_service_1 = require("./providers/nedbank.service");
const okra_service_1 = require("./providers/okra.service");
const transaction_categorization_service_1 = require("./services/transaction-categorization.service");
const fraud_detection_service_1 = require("./services/fraud-detection.service");
const banking_insights_service_1 = require("./services/banking-insights.service");
const payment_service_1 = require("./services/payment.service");
const banking_interface_1 = require("./interfaces/banking.interface");
let BankingIntegrationService = BankingIntegrationService_1 = class BankingIntegrationService {
    constructor(configService, advancedLogger, mcpFramework, aiAutomation, goalTracker, nedBankService, okraService, transactionCategorization, fraudDetection, bankingInsights, paymentService) {
        this.configService = configService;
        this.advancedLogger = advancedLogger;
        this.mcpFramework = mcpFramework;
        this.aiAutomation = aiAutomation;
        this.goalTracker = goalTracker;
        this.nedBankService = nedBankService;
        this.okraService = okraService;
        this.transactionCategorization = transactionCategorization;
        this.fraudDetection = fraudDetection;
        this.bankingInsights = bankingInsights;
        this.paymentService = paymentService;
        this.logger = new common_1.Logger(BankingIntegrationService_1.name);
        this.connections = new Map();
        this.accounts = new Map();
        this.transactions = new Map();
        this.southAfricanBanks = [];
        this.initializeBankingSystem();
    }
    async initializeBankingSystem() {
        this.logger.log('Initializing South African Banking Integration System');
        try {
            await this.loadSouthAfricanBanks();
            await this.initializeBankingProviders();
            await this.fraudDetection.initializeFraudRules();
            await this.transactionCategorization.initializeModels();
            this.advancedLogger.logFinancial('Banking integration system initialized', {
                operation: 'system_initialization',
                success: true,
                metadata: {
                    supportedBanks: this.southAfricanBanks.length,
                    providersConfigured: 2,
                },
            });
            this.logger.log('South African Banking Integration System ready');
        }
        catch (error) {
            this.logger.error('Failed to initialize banking system:', error);
            throw error;
        }
    }
    async loadSouthAfricanBanks() {
        this.southAfricanBanks = [
            {
                bankId: 'nedbank',
                name: 'Nedbank Limited',
                shortName: 'Nedbank',
                universalBranchCode: '198765',
                swiftCode: 'NEDSZAJJ',
                logo: '/assets/banks/nedbank.png',
                website: 'https://www.nedbank.co.za',
                supportLevel: 'full',
                apiEndpoint: 'https://api.nedbank.co.za',
                features: {
                    openBanking: true,
                    instantPayments: true,
                    sameDay: true,
                    internationalTransfers: true,
                },
                fees: {
                    monthlyAdmin: 95.00,
                    eftFee: 7.50,
                    debitOrderFee: 5.00,
                    cardFee: 2.50,
                },
            },
            {
                bankId: 'standardbank',
                name: 'The Standard Bank of South Africa Limited',
                shortName: 'Standard Bank',
                universalBranchCode: '051001',
                swiftCode: 'SBZAZAJJ',
                logo: '/assets/banks/standardbank.png',
                website: 'https://www.standardbank.co.za',
                supportLevel: 'full',
                features: {
                    openBanking: true,
                    instantPayments: true,
                    sameDay: true,
                    internationalTransfers: true,
                },
                fees: {
                    monthlyAdmin: 85.00,
                    eftFee: 8.00,
                    debitOrderFee: 5.50,
                    cardFee: 3.00,
                },
            },
            {
                bankId: 'absa',
                name: 'Absa Bank Limited',
                shortName: 'Absa',
                universalBranchCode: '632005',
                swiftCode: 'ABSAZAJJ',
                logo: '/assets/banks/absa.png',
                website: 'https://www.absa.co.za',
                supportLevel: 'full',
                features: {
                    openBanking: true,
                    instantPayments: true,
                    sameDay: true,
                    internationalTransfers: true,
                },
                fees: {
                    monthlyAdmin: 99.00,
                    eftFee: 7.95,
                    debitOrderFee: 5.25,
                    cardFee: 2.95,
                },
            },
            {
                bankId: 'fnb',
                name: 'First National Bank',
                shortName: 'FNB',
                universalBranchCode: '250655',
                swiftCode: 'FIRNZAJJ',
                logo: '/assets/banks/fnb.png',
                website: 'https://www.fnb.co.za',
                supportLevel: 'full',
                features: {
                    openBanking: true,
                    instantPayments: true,
                    sameDay: true,
                    internationalTransfers: true,
                },
                fees: {
                    monthlyAdmin: 89.00,
                    eftFee: 7.50,
                    debitOrderFee: 4.50,
                    cardFee: 2.00,
                },
            },
            {
                bankId: 'capitecbank',
                name: 'Capitec Bank Limited',
                shortName: 'Capitec',
                universalBranchCode: '470010',
                swiftCode: 'CABLZAJJ',
                logo: '/assets/banks/capitec.png',
                website: 'https://www.capitecbank.co.za',
                supportLevel: 'full',
                features: {
                    openBanking: true,
                    instantPayments: true,
                    sameDay: true,
                    internationalTransfers: false,
                },
                fees: {
                    monthlyAdmin: 5.50,
                    eftFee: 3.50,
                    debitOrderFee: 2.50,
                    cardFee: 1.00,
                },
            },
            {
                bankId: 'tymebank',
                name: 'TymeBank',
                shortName: 'TymeBank',
                universalBranchCode: '678910',
                swiftCode: 'TYMEZAJJ',
                logo: '/assets/banks/tymebank.png',
                website: 'https://www.tymebank.co.za',
                supportLevel: 'limited',
                features: {
                    openBanking: false,
                    instantPayments: true,
                    sameDay: true,
                    internationalTransfers: false,
                },
                fees: {
                    monthlyAdmin: 0.00,
                    eftFee: 1.50,
                    debitOrderFee: 1.00,
                    cardFee: 0.00,
                },
            },
        ];
        this.logger.log(`Loaded ${this.southAfricanBanks.length} South African banks`);
    }
    async initializeBankingProviders() {
        await this.nedBankService.initialize();
        await this.okraService.initialize();
        this.logger.log('Banking providers initialized');
    }
    async connectBank(userId, bankId, connectionMethod = 'okra') {
        const startTime = Date.now();
        try {
            this.advancedLogger.logFinancial(`Connecting to bank: ${bankId}`, {
                operation: 'bank_connection_start',
                userId,
                metadata: { bankId, connectionMethod },
            });
            let connection;
            if (connectionMethod === 'direct' && bankId === 'nedbank') {
                connection = await this.nedBankService.connect(userId);
            }
            else {
                connection = await this.okraService.connectBank(userId, bankId);
            }
            this.connections.set(connection.id, connection);
            await this.syncAccountData(connection.id);
            this.advancedLogger.logFinancial(`Bank connection successful: ${bankId}`, {
                operation: 'bank_connection_complete',
                userId,
                success: true,
                duration: Date.now() - startTime,
                metadata: { connectionId: connection.id, accountCount: connection.accounts.length },
            });
            await this.aiAutomation.executeAutomationWorkflow('financial_sync', {
                userId,
                triggeredBy: 'event',
                timestamp: new Date(),
                data: { connectionId: connection.id, bankId },
            });
            return connection;
        }
        catch (error) {
            this.advancedLogger.error(`Bank connection failed: ${bankId}`, error, {
                operation: 'bank_connection_error',
                userId,
                metadata: { bankId, connectionMethod },
            });
            throw error;
        }
    }
    async syncAccountData(connectionId) {
        const connection = this.connections.get(connectionId);
        if (!connection) {
            throw new Error(`Connection not found: ${connectionId}`);
        }
        const results = [];
        try {
            this.advancedLogger.logFinancial(`Starting account sync: ${connectionId}`, {
                operation: 'account_sync_start',
                metadata: { connectionId, accountCount: connection.accounts.length },
            });
            let accounts;
            let transactions;
            if (connection.providerId === 'nedbank') {
                accounts = await this.nedBankService.getAccounts(connection);
                transactions = await this.nedBankService.getTransactions(connection);
            }
            else {
                accounts = await this.okraService.getAccounts(connection);
                transactions = await this.okraService.getTransactions(connection);
            }
            for (const account of accounts) {
                this.accounts.set(account.id, account);
                const accountTransactions = transactions[account.id] || [];
                const existingTransactions = this.transactions.get(account.id) || [];
                const categorizedTransactions = await Promise.all(accountTransactions.map(async (transaction) => {
                    const category = await this.transactionCategorization.categorizeTransaction(transaction);
                    return { ...transaction, category };
                }));
                const fraudCheckedTransactions = await Promise.all(categorizedTransactions.map(async (transaction) => {
                    const fraudScore = await this.fraudDetection.analyzeTransaction(transaction, account);
                    return { ...transaction, fraudScore };
                }));
                await this.updateGoalProgress(fraudCheckedTransactions);
                this.transactions.set(account.id, fraudCheckedTransactions);
                const newTransactions = fraudCheckedTransactions.filter(t => !existingTransactions.some(et => et.externalId === t.externalId));
                results.push({
                    success: true,
                    accountId: account.id,
                    newTransactions: newTransactions.length,
                    updatedTransactions: 0,
                    duplicateTransactions: fraudCheckedTransactions.length - newTransactions.length,
                    errorCount: 0,
                    errors: [],
                    syncedPeriod: {
                        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        to: new Date(),
                    },
                });
                if (account.accountType === 'savings' || account.accountType === 'current') {
                    await this.updateNetWorthFromAccounts();
                }
            }
            connection.lastSyncAt = new Date();
            this.connections.set(connectionId, connection);
            this.advancedLogger.logFinancial(`Account sync completed: ${connectionId}`, {
                operation: 'account_sync_complete',
                success: true,
                metadata: {
                    connectionId,
                    accountsSynced: accounts.length,
                    totalNewTransactions: results.reduce((sum, r) => sum + r.newTransactions, 0),
                },
            });
            return results;
        }
        catch (error) {
            this.advancedLogger.error(`Account sync failed: ${connectionId}`, error, {
                operation: 'account_sync_error',
                metadata: { connectionId },
            });
            throw error;
        }
    }
    async updateNetWorthFromAccounts() {
        const totalBalance = Array.from(this.accounts.values())
            .filter(acc => acc.accountType === 'savings' || acc.accountType === 'current')
            .reduce((sum, acc) => sum + acc.balance, 0);
        const netWorthGoal = this.goalTracker.getGoal('net_worth_1800000');
        if (netWorthGoal) {
            await this.goalTracker.updateGoalProgress(netWorthGoal.id, totalBalance, 'automated', ['banking_sync', 'account_balance_update']);
        }
    }
    async updateGoalProgress(transactions) {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayRevenue = transactions
            .filter(t => t.date >= todayStart &&
            t.type === 'credit' &&
            t.category === banking_interface_1.TransactionCategory.BUSINESS_REVENUE)
            .reduce((sum, t) => sum + t.amount, 0);
        if (todayRevenue > 0) {
            const revenueGoal = this.goalTracker.getGoal('daily_revenue_4881');
            if (revenueGoal) {
                await this.goalTracker.updateGoalProgress(revenueGoal.id, todayRevenue, 'automated', ['banking_sync', 'revenue_calculation']);
            }
        }
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthlyRevenue = transactions
            .filter(t => t.date >= monthStart &&
            t.type === 'credit' &&
            (t.category === banking_interface_1.TransactionCategory.BUSINESS_REVENUE || t.isRecurring))
            .reduce((sum, t) => sum + t.amount, 0);
        if (monthlyRevenue > 0) {
            const mrrGoal = this.goalTracker.getGoal('mrr_147917');
            if (mrrGoal) {
                await this.goalTracker.updateGoalProgress(mrrGoal.id, monthlyRevenue, 'automated', ['banking_sync', 'mrr_calculation']);
            }
        }
    }
    async getBankingDashboard(userId) {
        const userAccounts = Array.from(this.accounts.values())
            .filter(acc => acc.id.includes(userId));
        const totalBalance = userAccounts.reduce((sum, acc) => sum + acc.balance, 0);
        const totalAvailableBalance = userAccounts.reduce((sum, acc) => sum + acc.availableBalance, 0);
        const monthStart = new Date();
        monthStart.setDate(1);
        let monthlyIncome = 0;
        let monthlyExpenses = 0;
        const categoryTotals = new Map();
        for (const account of userAccounts) {
            const accountTransactions = this.transactions.get(account.id) || [];
            const monthlyTransactions = accountTransactions.filter(t => t.date >= monthStart);
            for (const transaction of monthlyTransactions) {
                if (transaction.type === 'credit') {
                    monthlyIncome += transaction.amount;
                }
                else {
                    monthlyExpenses += transaction.amount;
                }
                const categoryTotal = categoryTotals.get(transaction.category) || 0;
                categoryTotals.set(transaction.category, categoryTotal + Math.abs(transaction.amount));
            }
        }
        const topExpenseCategories = Array.from(categoryTotals.entries())
            .filter(([category]) => category !== banking_interface_1.TransactionCategory.SALARY && category !== banking_interface_1.TransactionCategory.BUSINESS_REVENUE)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([category, amount]) => ({
            category,
            amount,
            percentage: (amount / monthlyExpenses) * 100,
            change: 0,
        }));
        const allTransactions = Array.from(this.transactions.values()).flat();
        const recentTransactions = allTransactions
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 10);
        const goals = this.goalTracker.getGoals();
        const goalProgress = goals.map(goal => ({
            goalId: goal.id,
            goalName: goal.name,
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            progressPercentage: (goal.currentAmount / goal.targetAmount) * 100,
            monthlyContribution: 0,
        }));
        const insights = await this.bankingInsights.generateInsights(userId, userAccounts, allTransactions);
        return {
            totalBalance,
            totalAvailableBalance,
            monthlyIncome,
            monthlyExpenses,
            netWorthChange: 0,
            savingsRate: monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0,
            topExpenseCategories,
            upcomingPayments: [],
            recentTransactions,
            budgetSummary: {
                totalBudget: 0,
                totalSpent: monthlyExpenses,
                remainingBudget: 0,
                categoriesOverBudget: 0,
            },
            goalProgress,
            alerts: {
                fraudAlerts: await this.fraudDetection.getActiveAlertsCount(userId),
                budgetWarnings: 0,
                paymentDue: 0,
                lowBalance: userAccounts.filter(acc => acc.balance < 1000).length,
            },
            insights: insights.slice(0, 5),
        };
    }
    async scheduledAccountSync() {
        this.logger.log('Running scheduled account synchronization');
        for (const [connectionId, connection] of this.connections) {
            if (connection.status === 'active' && connection.metadata.autoSync) {
                try {
                    await this.syncAccountData(connectionId);
                }
                catch (error) {
                    this.logger.error(`Failed to sync connection ${connectionId}:`, error);
                    connection.status = 'error';
                    connection.errorMessage = error.message;
                    this.connections.set(connectionId, connection);
                }
            }
        }
    }
    async scheduledFraudDetection() {
        this.logger.log('Running scheduled fraud detection');
        for (const [accountId, transactions] of this.transactions) {
            const account = this.accounts.get(accountId);
            if (!account)
                continue;
            const recentTransactions = transactions.filter(t => t.date > new Date(Date.now() - 2 * 60 * 60 * 1000));
            for (const transaction of recentTransactions) {
                if (!transaction.fraudScore || transaction.fraudScore === 0) {
                    const fraudScore = await this.fraudDetection.analyzeTransaction(transaction, account);
                    transaction.fraudScore = fraudScore;
                    if (fraudScore > 70) {
                        await this.createFraudAlert(transaction, account);
                    }
                }
            }
        }
    }
    async createFraudAlert(transaction, account) {
        const alert = {
            id: `fraud_${Date.now()}`,
            transactionId: transaction.id,
            accountId: account.id,
            type: 'unusual_amount',
            severity: transaction.fraudScore > 90 ? 'critical' : transaction.fraudScore > 80 ? 'high' : 'medium',
            score: transaction.fraudScore,
            description: `Potentially fraudulent transaction detected: ${transaction.description}`,
            triggers: ['high_fraud_score'],
            createdAt: new Date(),
            status: 'open',
            notificationSent: false,
            actions: {
                accountBlocked: false,
                cardBlocked: false,
                notificationSent: false,
                manualReviewRequired: true,
            },
        };
        const message = {
            jsonrpc: '2.0',
            id: `fraud_alert_${Date.now()}`,
            method: 'create_task',
            params: {
                name: `🚨 Fraud Alert: ${transaction.description}`,
                notes: `Potential fraud detected on account ${account.accountName}\n\nTransaction: ${transaction.description}\nAmount: R${transaction.amount.toLocaleString()}\nFraud Score: ${transaction.fraudScore}/100\n\nImmediate review required.`,
                priority: 'urgent',
                projects: ['fraud_monitoring'],
            },
        };
        await this.mcpFramework.sendMessage('asana_server', message);
        this.advancedLogger.logSecurity(`Fraud alert created: ${alert.id}`, {
            operation: 'fraud_alert_created',
            metadata: {
                alertId: alert.id,
                transactionId: transaction.id,
                fraudScore: transaction.fraudScore,
                severity: alert.severity,
            },
        });
    }
    getConnections() {
        return Array.from(this.connections.values());
    }
    getAccounts(userId) {
        const accounts = Array.from(this.accounts.values());
        return userId ? accounts.filter(acc => acc.id.includes(userId)) : accounts;
    }
    getTransactions(accountId) {
        return this.transactions.get(accountId) || [];
    }
    getSouthAfricanBanks() {
        return this.southAfricanBanks;
    }
    async disconnectBank(connectionId) {
        const connection = this.connections.get(connectionId);
        if (connection) {
            connection.status = 'inactive';
            this.connections.set(connectionId, connection);
            this.advancedLogger.logFinancial(`Bank disconnected: ${connectionId}`, {
                operation: 'bank_disconnection',
                metadata: { connectionId },
            });
        }
    }
    async getConnectionStatus(connectionId) {
        return this.connections.get(connectionId);
    }
};
exports.BankingIntegrationService = BankingIntegrationService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BankingIntegrationService.prototype, "scheduledAccountSync", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_MINUTES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BankingIntegrationService.prototype, "scheduledFraudDetection", null);
exports.BankingIntegrationService = BankingIntegrationService = BankingIntegrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        advanced_logger_service_1.AdvancedLoggerService,
        mcp_framework_service_1.MCPFrameworkService,
        ai_automation_service_1.AIAutomationService,
        financial_goal_tracker_service_1.FinancialGoalTrackerService,
        nedbank_service_1.NedBankService,
        okra_service_1.OkraService,
        transaction_categorization_service_1.TransactionCategorizationService,
        fraud_detection_service_1.FraudDetectionService,
        banking_insights_service_1.BankingInsightsService,
        payment_service_1.PaymentService])
], BankingIntegrationService);
//# sourceMappingURL=banking-integration.service.js.map