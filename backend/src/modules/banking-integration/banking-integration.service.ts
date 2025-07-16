import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdvancedLoggerService } from '../../common/logger/advanced-logger.service';
import { MCPFrameworkService } from '../mcp-framework/mcp-framework.service';
import { AIAutomationService } from '../ai-automation/ai-automation.service';
import { FinancialGoalTrackerService } from '../ai-automation/financial-goal-tracker.service';
import { NedBankService } from './providers/nedbank.service';
import { OkraService } from './providers/okra.service';
import { TransactionCategorizationService } from './services/transaction-categorization.service';
import { FraudDetectionService } from './services/fraud-detection.service';
import { BankingInsightsService } from './services/banking-insights.service';
import { PaymentService } from './services/payment.service';
import {
  BankAccount,
  Transaction,
  BankConnection,
  TransactionSyncResult,
  BankingDashboard,
  SouthAfricanBankInfo,
  BankingProvider,
  FraudAlert,
  BankingInsight,
  TransactionCategory,
} from './interfaces/banking.interface';

@Injectable()
export class BankingIntegrationService {
  private readonly logger = new Logger(BankingIntegrationService.name);
  private connections = new Map<string, BankConnection>();
  private accounts = new Map<string, BankAccount>();
  private transactions = new Map<string, Transaction[]>();
  private southAfricanBanks: SouthAfricanBankInfo[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly advancedLogger: AdvancedLoggerService,
    private readonly mcpFramework: MCPFrameworkService,
    private readonly aiAutomation: AIAutomationService,
    private readonly goalTracker: FinancialGoalTrackerService,
    private readonly nedBankService: NedBankService,
    private readonly okraService: OkraService,
    private readonly transactionCategorization: TransactionCategorizationService,
    private readonly fraudDetection: FraudDetectionService,
    private readonly bankingInsights: BankingInsightsService,
    private readonly paymentService: PaymentService,
  ) {
    this.initializeBankingSystem();
  }

  private async initializeBankingSystem(): Promise<void> {
    this.logger.log('Initializing South African Banking Integration System');

    try {
      // Initialize South African bank information
      await this.loadSouthAfricanBanks();

      // Initialize banking providers
      await this.initializeBankingProviders();

      // Set up fraud detection
      await this.fraudDetection.initializeFraudRules();

      // Initialize transaction categorization models
      await this.transactionCategorization.initializeModels();

      this.advancedLogger.logFinancial('Banking integration system initialized', {
        operation: 'system_initialization',
        success: true,
        metadata: {
          supportedBanks: this.southAfricanBanks.length,
          providersConfigured: 2, // Nedbank + Okra
        },
      });

      this.logger.log('South African Banking Integration System ready');
    } catch (error) {
      this.logger.error('Failed to initialize banking system:', error);
      throw error;
    }
  }

  /**
   * Load South African bank information
   */
  private async loadSouthAfricanBanks(): Promise<void> {
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

  /**
   * Initialize banking providers
   */
  private async initializeBankingProviders(): Promise<void> {
    // Initialize Nedbank direct integration
    await this.nedBankService.initialize();

    // Initialize Okra multi-bank aggregator
    await this.okraService.initialize();

    this.logger.log('Banking providers initialized');
  }

  /**
   * Connect to a bank account
   */
  async connectBank(
    userId: string,
    bankId: string,
    connectionMethod: 'direct' | 'okra' = 'okra'
  ): Promise<BankConnection> {
    const startTime = Date.now();

    try {
      this.advancedLogger.logFinancial(`Connecting to bank: ${bankId}`, {
        operation: 'bank_connection_start',
        userId,
        metadata: { bankId, connectionMethod },
      });

      let connection: BankConnection;

      if (connectionMethod === 'direct' && bankId === 'nedbank') {
        connection = await this.nedBankService.connect(userId);
      } else {
        connection = await this.okraService.connectBank(userId, bankId);
      }

      // Store connection
      this.connections.set(connection.id, connection);

      // Sync initial account data
      await this.syncAccountData(connection.id);

      this.advancedLogger.logFinancial(`Bank connection successful: ${bankId}`, {
        operation: 'bank_connection_complete',
        userId,
        success: true,
        duration: Date.now() - startTime,
        metadata: { connectionId: connection.id, accountCount: connection.accounts.length },
      });

      // Trigger AI automation workflow
      await this.aiAutomation.executeAutomationWorkflow('financial_sync', {
        userId,
        triggeredBy: 'event',
        timestamp: new Date(),
        data: { connectionId: connection.id, bankId },
      });

      return connection;
    } catch (error) {
      this.advancedLogger.error(`Bank connection failed: ${bankId}`, error, {
        operation: 'bank_connection_error',
        userId,
        metadata: { bankId, connectionMethod },
      });

      throw error;
    }
  }

  /**
   * Sync account data from connected banks
   */
  async syncAccountData(connectionId: string): Promise<TransactionSyncResult[]> {
    const connection = this.connections.get(connectionId);
    if (!connection) {
      throw new Error(`Connection not found: ${connectionId}`);
    }

    const results: TransactionSyncResult[] = [];

    try {
      this.advancedLogger.logFinancial(`Starting account sync: ${connectionId}`, {
        operation: 'account_sync_start',
        metadata: { connectionId, accountCount: connection.accounts.length },
      });

      let accounts: BankAccount[];
      let transactions: { [accountId: string]: Transaction[] };

      // Get account data based on provider
      if (connection.providerId === 'nedbank') {
        accounts = await this.nedBankService.getAccounts(connection);
        transactions = await this.nedBankService.getTransactions(connection);
      } else {
        accounts = await this.okraService.getAccounts(connection);
        transactions = await this.okraService.getTransactions(connection);
      }

      // Process each account
      for (const account of accounts) {
        this.accounts.set(account.id, account);

        // Process transactions
        const accountTransactions = transactions[account.id] || [];
        const existingTransactions = this.transactions.get(account.id) || [];

        // Categorize new transactions
        const categorizedTransactions = await Promise.all(
          accountTransactions.map(async (transaction) => {
            const category = await this.transactionCategorization.categorizeTransaction(transaction);
            return { ...transaction, category };
          })
        );

        // Check for fraud
        const fraudCheckedTransactions = await Promise.all(
          categorizedTransactions.map(async (transaction) => {
            const fraudScore = await this.fraudDetection.analyzeTransaction(transaction, account);
            return { ...transaction, fraudScore };
          })
        );

        // Update goal progress based on transactions
        await this.updateGoalProgress(fraudCheckedTransactions);

        // Store transactions
        this.transactions.set(account.id, fraudCheckedTransactions);

        // Create sync result
        const newTransactions = fraudCheckedTransactions.filter(
          t => !existingTransactions.some(et => et.externalId === t.externalId)
        );

        results.push({
          success: true,
          accountId: account.id,
          newTransactions: newTransactions.length,
          updatedTransactions: 0,
          duplicateTransactions: fraudCheckedTransactions.length - newTransactions.length,
          errorCount: 0,
          errors: [],
          syncedPeriod: {
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            to: new Date(),
          },
        });

        // Update account balance in goals
        if (account.accountType === 'savings' || account.accountType === 'current') {
          await this.updateNetWorthFromAccounts();
        }
      }

      // Update connection
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
    } catch (error) {
      this.advancedLogger.error(`Account sync failed: ${connectionId}`, error, {
        operation: 'account_sync_error',
        metadata: { connectionId },
      });

      throw error;
    }
  }

  /**
   * Update net worth based on connected accounts
   */
  private async updateNetWorthFromAccounts(): Promise<void> {
    const totalBalance = Array.from(this.accounts.values())
      .filter(acc => acc.accountType === 'savings' || acc.accountType === 'current')
      .reduce((sum, acc) => sum + acc.balance, 0);

    const netWorthGoal = this.goalTracker.getGoal('net_worth_1800000');
    if (netWorthGoal) {
      await this.goalTracker.updateGoalProgress(
        netWorthGoal.id,
        totalBalance,
        'automated',
        ['banking_sync', 'account_balance_update']
      );
    }
  }

  /**
   * Update goal progress based on transactions
   */
  private async updateGoalProgress(transactions: Transaction[]): Promise<void> {
    // Calculate daily revenue for 43V3R business
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const todayRevenue = transactions
      .filter(t => 
        t.date >= todayStart && 
        t.type === 'credit' && 
        t.category === TransactionCategory.BUSINESS_REVENUE
      )
      .reduce((sum, t) => sum + t.amount, 0);

    if (todayRevenue > 0) {
      const revenueGoal = this.goalTracker.getGoal('daily_revenue_4881');
      if (revenueGoal) {
        await this.goalTracker.updateGoalProgress(
          revenueGoal.id,
          todayRevenue,
          'automated',
          ['banking_sync', 'revenue_calculation']
        );
      }
    }

    // Calculate monthly recurring revenue
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyRevenue = transactions
      .filter(t => 
        t.date >= monthStart && 
        t.type === 'credit' && 
        (t.category === TransactionCategory.BUSINESS_REVENUE || t.isRecurring)
      )
      .reduce((sum, t) => sum + t.amount, 0);

    if (monthlyRevenue > 0) {
      const mrrGoal = this.goalTracker.getGoal('mrr_147917');
      if (mrrGoal) {
        await this.goalTracker.updateGoalProgress(
          mrrGoal.id,
          monthlyRevenue,
          'automated',
          ['banking_sync', 'mrr_calculation']
        );
      }
    }
  }

  /**
   * Get banking dashboard data
   */
  async getBankingDashboard(userId: string): Promise<BankingDashboard> {
    const userAccounts = Array.from(this.accounts.values())
      .filter(acc => acc.id.includes(userId)); // Simplified user filtering

    const totalBalance = userAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalAvailableBalance = userAccounts.reduce((sum, acc) => sum + acc.availableBalance, 0);

    // Calculate monthly income and expenses
    const monthStart = new Date();
    monthStart.setDate(1);
    
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    const categoryTotals = new Map<TransactionCategory, number>();

    for (const account of userAccounts) {
      const accountTransactions = this.transactions.get(account.id) || [];
      const monthlyTransactions = accountTransactions.filter(t => t.date >= monthStart);

      for (const transaction of monthlyTransactions) {
        if (transaction.type === 'credit') {
          monthlyIncome += transaction.amount;
        } else {
          monthlyExpenses += transaction.amount;
        }

        const categoryTotal = categoryTotals.get(transaction.category) || 0;
        categoryTotals.set(transaction.category, categoryTotal + Math.abs(transaction.amount));
      }
    }

    // Top expense categories
    const topExpenseCategories = Array.from(categoryTotals.entries())
      .filter(([category]) => category !== TransactionCategory.SALARY && category !== TransactionCategory.BUSINESS_REVENUE)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / monthlyExpenses) * 100,
        change: 0, // Would calculate from previous month
      }));

    // Get recent transactions
    const allTransactions = Array.from(this.transactions.values()).flat();
    const recentTransactions = allTransactions
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    // Get goal progress
    const goals = this.goalTracker.getGoals();
    const goalProgress = goals.map(goal => ({
      goalId: goal.id,
      goalName: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      progressPercentage: (goal.currentAmount / goal.targetAmount) * 100,
      monthlyContribution: 0, // Would calculate from transaction history
    }));

    // Get insights
    const insights = await this.bankingInsights.generateInsights(userId, userAccounts, allTransactions);

    return {
      totalBalance,
      totalAvailableBalance,
      monthlyIncome,
      monthlyExpenses,
      netWorthChange: 0, // Would calculate from previous month
      savingsRate: monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0,
      topExpenseCategories,
      upcomingPayments: [], // Would get from payment service
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
      insights: insights.slice(0, 5), // Top 5 insights
    };
  }

  /**
   * Scheduled account synchronization
   */
  @Cron(CronExpression.EVERY_HOUR)
  async scheduledAccountSync(): Promise<void> {
    this.logger.log('Running scheduled account synchronization');

    for (const [connectionId, connection] of this.connections) {
      if (connection.status === 'active' && connection.metadata.autoSync) {
        try {
          await this.syncAccountData(connectionId);
        } catch (error) {
          this.logger.error(`Failed to sync connection ${connectionId}:`, error);
          
          // Update connection status
          connection.status = 'error';
          connection.errorMessage = error.message;
          this.connections.set(connectionId, connection);
        }
      }
    }
  }

  /**
   * Scheduled fraud detection
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async scheduledFraudDetection(): Promise<void> {
    this.logger.log('Running scheduled fraud detection');

    for (const [accountId, transactions] of this.transactions) {
      const account = this.accounts.get(accountId);
      if (!account) continue;

      // Check recent transactions for fraud
      const recentTransactions = transactions.filter(
        t => t.date > new Date(Date.now() - 2 * 60 * 60 * 1000) // Last 2 hours
      );

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

  /**
   * Create fraud alert
   */
  private async createFraudAlert(transaction: Transaction, account: BankAccount): Promise<void> {
    const alert: FraudAlert = {
      id: `fraud_${Date.now()}`,
      transactionId: transaction.id,
      accountId: account.id,
      type: 'unusual_amount',
      severity: transaction.fraudScore! > 90 ? 'critical' : transaction.fraudScore! > 80 ? 'high' : 'medium',
      score: transaction.fraudScore!,
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

    // Send notification via MCP framework
    const message = {
      jsonrpc: '2.0' as const,
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

  /**
   * Public API methods
   */
  getConnections(): BankConnection[] {
    return Array.from(this.connections.values());
  }

  getAccounts(userId?: string): BankAccount[] {
    const accounts = Array.from(this.accounts.values());
    return userId ? accounts.filter(acc => acc.id.includes(userId)) : accounts;
  }

  getTransactions(accountId: string): Transaction[] {
    return this.transactions.get(accountId) || [];
  }

  getSouthAfricanBanks(): SouthAfricanBankInfo[] {
    return this.southAfricanBanks;
  }

  async disconnectBank(connectionId: string): Promise<void> {
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

  async getConnectionStatus(connectionId: string): Promise<BankConnection | undefined> {
    return this.connections.get(connectionId);
  }
}