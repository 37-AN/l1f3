import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdvancedLoggerService } from '../../../common/logger/advanced-logger.service';
import {
  BankAccount,
  Transaction,
  BankConnection,
  TransactionCategory,
  AccountFees,
} from '../interfaces/banking.interface';

interface OkraConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
  version: string;
}

interface OkraAuthResponse {
  status: string;
  message: string;
  data: {
    id: string;
    customer_id: string;
    bank_id: string;
    env: string;
    status: string;
    auth: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
  };
}

interface OkraCustomerResponse {
  status: string;
  message: string;
  data: {
    _id: string;
    bank: {
      id: string;
      name: string;
      icon: string;
    };
    customer: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
    accounts: string[];
    created_at: string;
    last_updated: string;
  };
}

interface OkraAccountsResponse {
  status: string;
  message: string;
  data: {
    accounts: Array<{
      _id: string;
      name: string;
      type: string;
      number: string;
      bank: {
        id: string;
        name: string;
        icon: string;
      };
      currency: string;
      balance: {
        available: number;
        current: number;
        limit: number;
      };
      nuban: string;
      bvn: string;
      created_at: string;
      last_updated: string;
    }>;
  };
}

interface OkraTransactionsResponse {
  status: string;
  message: string;
  data: {
    transactions: Array<{
      _id: string;
      account: string;
      amount: number;
      currency: string;
      description: string;
      reference: string;
      type: 'debit' | 'credit';
      category: string;
      date: string;
      balance: number;
      branch: string;
      channel: string;
      location: {
        lat: number;
        lng: number;
        city: string;
        state: string;
        country: string;
      };
      merchant: {
        name: string;
        category: string;
        mcc: string;
      };
      created_at: string;
      last_updated: string;
    }>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

@Injectable()
export class OkraService {
  private readonly logger = new Logger(OkraService.name);
  private config: OkraConfig;
  private customerTokens = new Map<string, { customerId: string; accessToken: string; expiresAt: Date }>();
  
  // South African banks supported by Okra
  private supportedBanks = [
    { id: 'standardbank', name: 'Standard Bank', code: '051001' },
    { id: 'absa', name: 'Absa Bank', code: '632005' },
    { id: 'fnb', name: 'First National Bank', code: '250655' },
    { id: 'nedbank', name: 'Nedbank', code: '198765' },
    { id: 'capitecbank', name: 'Capitec Bank', code: '470010' },
    { id: 'investec', name: 'Investec Bank', code: '580105' },
    { id: 'discovery', name: 'Discovery Bank', code: '679000' },
    { id: 'tymebank', name: 'TymeBank', code: '678910' },
  ];

  constructor(
    private readonly configService: ConfigService,
    private readonly advancedLogger: AdvancedLoggerService,
  ) {
    this.loadConfiguration();
  }

  private loadConfiguration(): void {
    this.config = {
      apiKey: this.configService.get('OKRA_API_KEY', 'sandbox_api_key'),
      secretKey: this.configService.get('OKRA_SECRET_KEY', 'sandbox_secret_key'),
      baseUrl: this.configService.get('OKRA_BASE_URL', 'https://api.okra.ng/sandbox/v1'),
      environment: this.configService.get('OKRA_ENVIRONMENT', 'sandbox') as 'sandbox' | 'production',
      version: 'v1',
    };
  }

  async initialize(): Promise<void> {
    this.logger.log('Initializing Okra multi-bank integration');
    
    if (this.config.environment === 'sandbox') {
      this.logger.warn('Okra integration running in SANDBOX mode');
    }

    // Validate API credentials
    await this.validateCredentials();

    this.advancedLogger.logFinancial('Okra service initialized', {
      operation: 'okra_initialization',
      metadata: {
        environment: this.config.environment,
        supportedBanks: this.supportedBanks.length,
        baseUrl: this.config.baseUrl,
      },
    });
  }

  /**
   * Validate Okra API credentials
   */
  private async validateCredentials(): Promise<void> {
    try {
      const response = await this.makeOkraRequest('/auth/banks', 'GET');
      if (response.status !== 'success') {
        throw new Error('Invalid Okra credentials');
      }
      this.logger.log('Okra credentials validated successfully');
    } catch (error) {
      this.logger.error('Okra credential validation failed:', error);
      throw new Error('Failed to validate Okra credentials');
    }
  }

  /**
   * Connect bank via Okra widget
   */
  async connectBank(userId: string, bankId: string): Promise<BankConnection> {
    try {
      this.advancedLogger.logFinancial(`Initiating Okra bank connection: ${bankId}`, {
        operation: 'okra_connection_start',
        userId,
        metadata: { bankId },
      });

      // In sandbox mode, simulate successful connection
      if (this.config.environment === 'sandbox') {
        return this.createSandboxConnection(userId, bankId);
      }

      // Generate Okra widget URL for real connections
      const widgetUrl = this.generateWidgetUrl(userId, bankId);
      throw new Error(`Please complete Okra widget flow: ${widgetUrl}`);
    } catch (error) {
      this.advancedLogger.error(`Okra bank connection failed: ${bankId}`, error, {
        operation: 'okra_connection_error',
        userId,
        metadata: { bankId },
      });
      throw error;
    }
  }

  /**
   * Create sandbox connection for testing
   */
  private createSandboxConnection(userId: string, bankId: string): BankConnection {
    const connectionId = `okra_${bankId}_${userId}_${Date.now()}`;
    const customerId = `okra_customer_${userId}`;
    
    const connection: BankConnection = {
      id: connectionId,
      userId,
      providerId: 'okra',
      bankId,
      status: 'active',
      accessToken: 'sandbox_okra_token',
      refreshToken: 'sandbox_okra_refresh',
      tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      accounts: [`okra_${bankId}_acc_1`, `okra_${bankId}_acc_2`],
      metadata: {
        connectedAt: new Date(),
        lastActiveAt: new Date(),
        syncFrequency: 'hourly',
        autoSync: true,
      },
    };

    // Store customer token
    this.customerTokens.set(connectionId, {
      customerId,
      accessToken: 'sandbox_okra_token',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    this.logger.log(`Sandbox Okra connection created: ${connectionId}`);
    return connection;
  }

  /**
   * Generate Okra widget URL
   */
  private generateWidgetUrl(userId: string, bankId: string): string {
    const params = new URLSearchParams({
      client_name: 'LIF3 Financial Dashboard',
      auth_method: 'internet_banking',
      callback_url: `${this.configService.get('APP_BASE_URL')}/auth/okra/callback`,
      webhook_url: `${this.configService.get('APP_BASE_URL')}/webhooks/okra`,
      bank_id: bankId,
      customer_id: userId,
      environment: this.config.environment,
      version: this.config.version,
    });

    return `https://widget.okra.ng?${params.toString()}`;
  }

  /**
   * Handle Okra widget callback
   */
  async handleWidgetCallback(customerId: string, token: string, bankId: string): Promise<BankConnection> {
    try {
      // Verify the token with Okra
      const authResponse = await this.makeOkraRequest('/auth/verify', 'POST', {
        token,
        customer_id: customerId,
      });

      if (authResponse.status !== 'success') {
        throw new Error('Invalid Okra token');
      }

      const authData: OkraAuthResponse = authResponse;
      const connectionId = `okra_${bankId}_${customerId}_${Date.now()}`;

      const connection: BankConnection = {
        id: connectionId,
        userId: customerId,
        providerId: 'okra',
        bankId,
        status: 'active',
        accessToken: authData.data.auth.access_token,
        refreshToken: authData.data.auth.refresh_token,
        tokenExpiresAt: new Date(Date.now() + authData.data.auth.expires_in * 1000),
        accounts: [], // Will be populated after fetching accounts
        metadata: {
          connectedAt: new Date(),
          lastActiveAt: new Date(),
          syncFrequency: 'hourly',
          autoSync: true,
        },
      };

      // Store customer token
      this.customerTokens.set(connectionId, {
        customerId: authData.data.customer_id,
        accessToken: authData.data.auth.access_token,
        expiresAt: new Date(Date.now() + authData.data.auth.expires_in * 1000),
      });

      this.advancedLogger.logFinancial(`Okra connection established: ${connectionId}`, {
        operation: 'okra_connection_complete',
        userId: customerId,
        metadata: { connectionId, bankId },
      });

      return connection;
    } catch (error) {
      this.advancedLogger.error('Okra widget callback failed', error, {
        operation: 'okra_callback_error',
        metadata: { customerId, bankId },
      });
      throw error;
    }
  }

  /**
   * Get accounts via Okra API
   */
  async getAccounts(connection: BankConnection): Promise<BankAccount[]> {
    try {
      if (this.config.environment === 'sandbox') {
        return this.getSandboxAccounts(connection);
      }

      const tokenInfo = this.customerTokens.get(connection.id);
      if (!tokenInfo) {
        throw new Error('No token found for connection');
      }

      const response = await this.makeOkraRequest('/accounts', 'GET', null, tokenInfo.accessToken);
      const accountsData: OkraAccountsResponse = response;

      const accounts: BankAccount[] = accountsData.data.accounts.map(acc => ({
        id: acc._id,
        accountNumber: acc.number,
        accountType: this.mapOkraAccountType(acc.type),
        bankId: connection.bankId,
        bankName: acc.bank.name,
        branchCode: this.getBankBranchCode(connection.bankId),
        accountName: acc.name,
        currency: acc.currency,
        balance: acc.balance.current,
        availableBalance: acc.balance.available,
        overdraftLimit: acc.balance.limit > acc.balance.current ? acc.balance.limit - acc.balance.current : undefined,
        fees: this.getBankFees(connection.bankId),
        isActive: true,
        lastSyncAt: new Date(),
        metadata: {
          productType: acc.type,
          accountOpenDate: new Date(acc.created_at),
          lastTransactionDate: new Date(acc.last_updated),
          monthlyLimit: 50000, // Default limits
          dailyLimit: 10000,
        },
      }));

      this.advancedLogger.logFinancial(`Retrieved ${accounts.length} accounts via Okra`, {
        operation: 'okra_accounts_retrieved',
        metadata: { 
          connectionId: connection.id, 
          bankId: connection.bankId,
          accountCount: accounts.length,
        },
      });

      return accounts;
    } catch (error) {
      this.advancedLogger.error('Failed to retrieve Okra accounts', error, {
        operation: 'okra_accounts_error',
        metadata: { connectionId: connection.id },
      });
      throw error;
    }
  }

  /**
   * Get transactions via Okra API
   */
  async getTransactions(connection: BankConnection): Promise<{ [accountId: string]: Transaction[] }> {
    try {
      if (this.config.environment === 'sandbox') {
        return this.getSandboxTransactions(connection);
      }

      const tokenInfo = this.customerTokens.get(connection.id);
      if (!tokenInfo) {
        throw new Error('No token found for connection');
      }

      const transactions: { [accountId: string]: Transaction[] } = {};

      // Get transactions for each account
      for (const accountId of connection.accounts) {
        const response = await this.makeOkraRequest(`/transactions/${accountId}`, 'GET', null, tokenInfo.accessToken);
        const transactionsData: OkraTransactionsResponse = response;

        const accountTransactions: Transaction[] = transactionsData.data.transactions.map(txn => ({
          id: txn._id,
          accountId: txn.account,
          externalId: txn._id,
          type: txn.type,
          amount: Math.abs(txn.amount),
          currency: txn.currency,
          description: txn.description,
          reference: txn.reference,
          category: this.mapOkraCategory(txn.category),
          date: new Date(txn.date),
          valueDate: new Date(txn.date),
          balance: txn.balance,
          location: txn.location ? {
            city: txn.location.city,
            province: txn.location.state,
            country: txn.location.country,
            coordinates: {
              latitude: txn.location.lat,
              longitude: txn.location.lng,
            },
          } : undefined,
          merchant: txn.merchant ? {
            name: txn.merchant.name,
            category: txn.merchant.category,
            mcc: txn.merchant.mcc,
          } : undefined,
          paymentMethod: this.mapOkraChannel(txn.channel),
          status: 'completed',
          tags: [],
          isRecurring: false,
          isReviewed: false,
          metadata: {
            importedAt: new Date(),
            lastUpdated: new Date(txn.last_updated),
            confidence: 100,
            enrichmentVersion: '1.0',
          },
        }));

        transactions[accountId] = accountTransactions;
      }

      const totalTransactions = Object.values(transactions).reduce((sum, txns) => sum + txns.length, 0);
      this.advancedLogger.logFinancial(`Retrieved ${totalTransactions} transactions via Okra`, {
        operation: 'okra_transactions_retrieved',
        metadata: { 
          connectionId: connection.id, 
          bankId: connection.bankId,
          accountCount: connection.accounts.length,
          totalTransactions,
        },
      });

      return transactions;
    } catch (error) {
      this.advancedLogger.error('Failed to retrieve Okra transactions', error, {
        operation: 'okra_transactions_error',
        metadata: { connectionId: connection.id },
      });
      throw error;
    }
  }

  /**
   * Make authenticated request to Okra API
   */
  private async makeOkraRequest(endpoint: string, method: 'GET' | 'POST', body?: any, token?: string): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    };

    if (token) {
      headers['X-Okra-Token'] = token;
    }

    const requestOptions: RequestInit = {
      method,
      headers,
    };

    if (body && method === 'POST') {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      throw new Error(`Okra API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Generate sandbox accounts for testing
   */
  private getSandboxAccounts(connection: BankConnection): BankAccount[] {
    const bankInfo = this.supportedBanks.find(b => b.id === connection.bankId);
    const bankName = bankInfo?.name || 'Unknown Bank';

    return [
      {
        id: `okra_${connection.bankId}_acc_1`,
        accountNumber: `1${connection.bankId.substring(0, 9).padEnd(9, '0')}`,
        accountType: 'current',
        bankId: connection.bankId,
        bankName,
        branchCode: bankInfo?.code || '000000',
        accountName: `${bankName} Current Account`,
        currency: 'ZAR',
        balance: 15000.00 + Math.random() * 20000,
        availableBalance: 12000.00 + Math.random() * 18000,
        overdraftLimit: 5000.00,
        fees: this.getBankFees(connection.bankId),
        isActive: true,
        lastSyncAt: new Date(),
        metadata: {
          productType: 'Current Account',
          accountOpenDate: new Date('2022-03-01'),
          lastTransactionDate: new Date(),
          monthlyLimit: 50000,
          dailyLimit: 10000,
        },
      },
      {
        id: `okra_${connection.bankId}_acc_2`,
        accountNumber: `2${connection.bankId.substring(0, 9).padEnd(9, '0')}`,
        accountType: 'savings',
        bankId: connection.bankId,
        bankName,
        branchCode: bankInfo?.code || '000000',
        accountName: `${bankName} Savings Account`,
        currency: 'ZAR',
        balance: 50000.00 + Math.random() * 100000,
        availableBalance: 50000.00 + Math.random() * 100000,
        interestRate: 0.035 + Math.random() * 0.02,
        fees: this.getBankFees(connection.bankId, 'savings'),
        isActive: true,
        lastSyncAt: new Date(),
        metadata: {
          productType: 'Savings Account',
          accountOpenDate: new Date('2022-03-01'),
          lastTransactionDate: new Date(),
          monthlyLimit: 25000,
          dailyLimit: 5000,
        },
      },
    ];
  }

  /**
   * Generate sandbox transactions for testing
   */
  private getSandboxTransactions(connection: BankConnection): { [accountId: string]: Transaction[] } {
    const transactions: { [accountId: string]: Transaction[] } = {};

    for (let i = 0; i < connection.accounts.length; i++) {
      const accountId = connection.accounts[i];
      const accountTransactions: Transaction[] = [];

      // Generate 45 days of transactions
      for (let day = 0; day < 45; day++) {
        const transactionDate = new Date();
        transactionDate.setDate(transactionDate.getDate() - day);

        // Monthly salary (25th of each month, current account only)
        if (transactionDate.getDate() === 25 && i === 0) {
          accountTransactions.push({
            id: `okra_sal_${day}`,
            accountId,
            externalId: `SAL${transactionDate.getTime()}`,
            type: 'credit',
            amount: 32000.00 + Math.random() * 8000,
            currency: 'ZAR',
            description: 'SALARY DEPOSIT',
            reference: `SAL${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
            category: TransactionCategory.SALARY,
            date: transactionDate,
            valueDate: transactionDate,
            balance: 15000 + 32000,
            paymentMethod: 'eft',
            status: 'completed',
            tags: ['income', 'salary'],
            isRecurring: true,
            isReviewed: true,
            metadata: {
              importedAt: new Date(),
              lastUpdated: new Date(),
              confidence: 100,
              enrichmentVersion: '1.0',
            },
          });
        }

        // Business income (43V3R) - random days
        if (Math.random() > 0.7 && i === 0) {
          accountTransactions.push({
            id: `okra_biz_${day}_${Math.random()}`,
            accountId,
            externalId: `BIZ${transactionDate.getTime()}${Math.floor(Math.random() * 1000)}`,
            type: 'credit',
            amount: 500 + Math.random() * 3000,
            currency: 'ZAR',
            description: '43V3R BUSINESS PAYMENT',
            reference: `43V3R${Math.floor(Math.random() * 10000)}`,
            category: TransactionCategory.BUSINESS_REVENUE,
            date: transactionDate,
            valueDate: transactionDate,
            balance: 15000,
            paymentMethod: 'eft',
            status: 'completed',
            tags: ['business', '43v3r'],
            isRecurring: false,
            isReviewed: false,
            metadata: {
              importedAt: new Date(),
              lastUpdated: new Date(),
              confidence: 100,
              enrichmentVersion: '1.0',
            },
          });
        }

        // Regular transactions
        if (Math.random() > 0.4) {
          const isExpense = Math.random() > 0.25;
          const categories = isExpense 
            ? [TransactionCategory.GROCERIES, TransactionCategory.DINING, TransactionCategory.TRANSPORT_FUEL, 
               TransactionCategory.UTILITIES, TransactionCategory.ENTERTAINMENT, TransactionCategory.SHOPPING]
            : [TransactionCategory.FREELANCE, TransactionCategory.OTHER_INCOME];
          
          const category = categories[Math.floor(Math.random() * categories.length)];
          const amount = isExpense 
            ? Math.random() * 800 + 25
            : Math.random() * 1500 + 100;

          accountTransactions.push({
            id: `okra_txn_${day}_${Math.random()}`,
            accountId,
            externalId: `TXN${transactionDate.getTime()}${Math.floor(Math.random() * 1000)}`,
            type: isExpense ? 'debit' : 'credit',
            amount: Math.round(amount * 100) / 100,
            currency: 'ZAR',
            description: this.getOkraTransactionDescription(category, connection.bankId),
            reference: `REF${Math.floor(Math.random() * 100000)}`,
            category,
            date: transactionDate,
            valueDate: transactionDate,
            balance: 15000,
            location: Math.random() > 0.5 ? {
              city: this.getRandomSACity(),
              province: 'Gauteng',
              country: 'South Africa',
            } : undefined,
            paymentMethod: Math.random() > 0.6 ? 'card' : 'eft',
            status: 'completed',
            tags: [],
            isRecurring: false,
            isReviewed: false,
            metadata: {
              importedAt: new Date(),
              lastUpdated: new Date(),
              confidence: 90 + Math.random() * 10,
              enrichmentVersion: '1.0',
            },
          });
        }
      }

      transactions[accountId] = accountTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    return transactions;
  }

  /**
   * Helper methods
   */
  private mapOkraAccountType(okraType: string): 'savings' | 'current' | 'credit' | 'investment' | 'loan' {
    switch (okraType.toLowerCase()) {
      case 'savings':
        return 'savings';
      case 'current':
      case 'checking':
        return 'current';
      case 'credit':
      case 'credit_card':
        return 'credit';
      case 'investment':
      case 'fixed_deposit':
        return 'investment';
      case 'loan':
        return 'loan';
      default:
        return 'current';
    }
  }

  private mapOkraCategory(okraCategory: string): TransactionCategory {
    const categoryMap: { [key: string]: TransactionCategory } = {
      'food_and_drink': TransactionCategory.DINING,
      'groceries': TransactionCategory.GROCERIES,
      'transport': TransactionCategory.TRANSPORT_FUEL,
      'utilities': TransactionCategory.UTILITIES,
      'entertainment': TransactionCategory.ENTERTAINMENT,
      'shopping': TransactionCategory.SHOPPING,
      'healthcare': TransactionCategory.MEDICAL,
      'salary': TransactionCategory.SALARY,
      'transfer': TransactionCategory.TRANSFER,
      'cash': TransactionCategory.CASH_WITHDRAWAL,
      'investment': TransactionCategory.INVESTMENTS,
      'business': TransactionCategory.BUSINESS_EXPENSE,
    };

    return categoryMap[okraCategory.toLowerCase()] || TransactionCategory.UNKNOWN;
  }

  private mapOkraChannel(channel: string): 'card' | 'eft' | 'debit_order' | 'cash' | 'cheque' | 'mobile' | 'online' {
    switch (channel.toLowerCase()) {
      case 'pos':
      case 'card':
        return 'card';
      case 'atm':
        return 'cash';
      case 'online':
      case 'internet':
        return 'online';
      case 'mobile':
        return 'mobile';
      case 'branch':
      case 'teller':
        return 'eft';
      default:
        return 'eft';
    }
  }

  private getBankBranchCode(bankId: string): string {
    const bank = this.supportedBanks.find(b => b.id === bankId);
    return bank?.code || '000000';
  }

  private getBankFees(bankId: string, accountType: 'current' | 'savings' = 'current'): AccountFees {
    // Simplified fee structure by bank
    const feeStructures: { [key: string]: AccountFees } = {
      standardbank: {
        monthlyFee: accountType === 'savings' ? 20.00 : 85.00,
        transactionFees: {
          eft: 8.00,
          debitOrder: 5.50,
          cashWithdrawal: 9.00,
          cardPurchase: 3.00,
          onlinePurchase: 1.50,
        },
      },
      absa: {
        monthlyFee: accountType === 'savings' ? 25.00 : 99.00,
        transactionFees: {
          eft: 7.95,
          debitOrder: 5.25,
          cashWithdrawal: 8.95,
          cardPurchase: 2.95,
          onlinePurchase: 1.50,
        },
      },
      fnb: {
        monthlyFee: accountType === 'savings' ? 15.00 : 89.00,
        transactionFees: {
          eft: 7.50,
          debitOrder: 4.50,
          cashWithdrawal: 8.00,
          cardPurchase: 2.00,
          onlinePurchase: 1.00,
        },
      },
      capitecbank: {
        monthlyFee: accountType === 'savings' ? 5.50 : 5.50,
        transactionFees: {
          eft: 3.50,
          debitOrder: 2.50,
          cashWithdrawal: 4.00,
          cardPurchase: 1.00,
          onlinePurchase: 0.50,
        },
      },
      tymebank: {
        monthlyFee: 0.00,
        transactionFees: {
          eft: 1.50,
          debitOrder: 1.00,
          cashWithdrawal: 2.00,
          cardPurchase: 0.00,
          onlinePurchase: 0.00,
        },
      },
    };

    return feeStructures[bankId] || feeStructures.standardbank;
  }

  private getOkraTransactionDescription(category: TransactionCategory, bankId: string): string {
    const descriptions = {
      [TransactionCategory.GROCERIES]: ['CHECKERS', 'PICK N PAY', 'WOOLWORTHS', 'SPAR', 'SHOPRITE', 'DISCHEM'],
      [TransactionCategory.DINING]: ['MCDONALDS', 'KFC', 'NANDOS', 'STEERS', 'WIMPY', 'BURGER KING', 'PIZZA HUT'],
      [TransactionCategory.TRANSPORT_FUEL]: ['SHELL', 'BP', 'SASOL', 'ENGEN', 'TOTAL', 'UBER', 'BOLT'],
      [TransactionCategory.UTILITIES]: ['ESKOM', 'CITY OF CAPE TOWN', 'VODACOM', 'MTN', 'TELKOM', 'RAIN'],
      [TransactionCategory.ENTERTAINMENT]: ['STER KINEKOR', 'NU METRO', 'SPOTIFY', 'NETFLIX', 'DSTV', 'SHOWMAX'],
      [TransactionCategory.SHOPPING]: ['GAME', 'MAKRO', 'BUILDERS WAREHOUSE', 'MR PRICE', 'EDGARS', 'FOSCHINI'],
      [TransactionCategory.FREELANCE]: ['FREELANCE PROJECT', 'CONSULTING FEE', 'DESIGN WORK', 'DEVELOPMENT WORK'],
      [TransactionCategory.OTHER_INCOME]: ['INVESTMENT RETURN', 'DIVIDEND', 'RENTAL INCOME', 'BONUS'],
    };

    const categoryDescriptions = descriptions[category] || ['GENERAL TRANSACTION'];
    return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
  }

  private getRandomSACity(): string {
    const cities = ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Pietermaritzburg'];
    return cities[Math.floor(Math.random() * cities.length)];
  }

  /**
   * Public methods
   */
  getSupportedBanks() {
    return this.supportedBanks;
  }

  async refreshToken(connectionId: string): Promise<void> {
    const tokenInfo = this.customerTokens.get(connectionId);
    if (!tokenInfo) {
      throw new Error('No token found for connection');
    }

    // In production, implement actual token refresh logic
    this.logger.log(`Token refresh not implemented for connection: ${connectionId}`);
  }
}